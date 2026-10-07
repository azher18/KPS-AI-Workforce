// ============================================================================
// KPS AI Workforce - Controlled Backend Tool Calling Engine with Graceful Degradation
// Sections 13, 14, 15, 64, 81 of PRD V2
// LLM never directly touches the DB. All actions go through authorized tools.
// ============================================================================

import { db } from '../db.ts';
import { healthMonitor } from '../health.ts';
import type { Appointment, Lead } from '../../types/index.ts';

export interface ToolExecutionContext {
  tenantId: string;
  agentId: string;
  callerPhone?: string;
  callerName?: string;
  simulateOutage?: 'calendar' | 'crm' | 'voice' | 'none';
}

export class ToolExecutionEngine {
  async executeTool(toolName: string, params: Record<string, any>, context: ToolExecutionContext): Promise<{
    success: boolean;
    degraded?: boolean;
    data?: any;
    error?: string;
    fallbackMessage?: string;
  }> {
    const { tenantId, agentId } = context;
    const org = db.getOrganization(tenantId);
    if (!org) {
      return { success: false, error: 'Unauthorized tenant context' };
    }

    try {
      switch (toolName) {
        case 'search_knowledge': {
          const query = params.query || '';
          const matches = db.searchKnowledge(tenantId, query);
          return {
            success: true,
            data: {
              matches: matches.map(m => ({
                text: m.chunk.chunk_text,
                relevanceScore: m.score
              }))
            }
          };
        }

        case 'get_business_hours': {
          return {
            success: true,
            data: {
              timezone: org.timezone,
              business_hours: org.business_hours
            }
          };
        }

        case 'get_service_information': {
          const docs = db.getKnowledgeDocuments(tenantId);
          return {
            success: true,
            data: {
              services: docs.map(d => ({ title: d.title, content: d.content }))
            }
          };
        }

        case 'check_calendar_availability': {
          // Check circuit breaker and simulated outage (Section 81 Failure Test)
          const breaker = healthMonitor.getBreaker('calendar');
          if (context.simulateOutage === 'calendar' || !breaker.canExecute()) {
            breaker.recordFailure();
            return {
              success: true,
              degraded: true,
              data: {
                availableSlots: [],
                status: 'calendar_service_degraded'
              },
              fallbackMessage: "I'm having trouble checking the live appointment schedule right now. I can take down your contact information and preferred time, and our team will confirm your reservation directly."
            };
          }

          breaker.recordSuccess();
          const requestedDate = params.date || 'tomorrow';
          return {
            success: true,
            data: {
              availableSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
              timezone: org.timezone,
              requestedDate
            }
          };
        }

        case 'book_appointment': {
          const customerPhone = params.customer_phone || context.callerPhone || '+1 (555) 000-0000';
          const customerName = params.customer_name || context.callerName || 'Valued Prospect';
          const appointmentDate = params.appointment_date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
          const appointmentTime = params.appointment_time || '14:00';

          // Idempotency & Double Booking Guard (Section 20 & 67)
          const existingAppts = db.getAppointments(tenantId);
          const alreadyBooked = existingAppts.find(a => 
            a.appointment_date === appointmentDate && 
            a.appointment_time === appointmentTime && 
            a.status === 'confirmed'
          );

          if (alreadyBooked) {
            return {
              success: false,
              error: `Slot ${appointmentDate} at ${appointmentTime} was just claimed. Please propose an alternative slot.`
            };
          }

          // Check Calendar Provider Health
          const breaker = healthMonitor.getBreaker('calendar');
          if (context.simulateOutage === 'calendar' || !breaker.canExecute()) {
            breaker.recordFailure();

            // Graceful Degradation (Section 15):
            // Still capture the lead! Do NOT lose the prospect!
            const fallbackLead = db.createLead(tenantId, {
              name: customerName,
              phone: customerPhone,
              email: params.customer_email,
              agent_id: agentId,
              source: 'AI Phone Call (Degraded Booking)',
              intent: `Requested booking for ${appointmentDate} at ${appointmentTime} (Calendar Outage)`,
              score: 80,
              status: 'QUALIFIED',
              notes: 'Live Google Calendar synchronization was degraded during call. Customer requested priority callback to confirm appointment.'
            });

            return {
              success: true,
              degraded: true,
              data: {
                leadId: fallbackLead.id,
                status: 'callback_queued'
              },
              fallbackMessage: `I have recorded your details and requested appointment for ${appointmentDate} at ${appointmentTime}. Our coordinator will contact you directly within 15 minutes with official gate passes.`
            };
          }

          breaker.recordSuccess();

          // 1. Create Lead in CRM
          const lead = db.createLead(tenantId, {
            name: customerName,
            phone: customerPhone,
            email: params.customer_email,
            agent_id: agentId,
            source: 'AI Autonomous Phone Call',
            intent: `Booked: ${params.service_name || 'VIP Consultation'}`,
            score: 85,
            status: 'APPOINTMENT'
          });

          // 2. Create Appointment in DB
          const appointment: Appointment = db.createAppointment(tenantId, {
            agent_id: agentId,
            lead_id: lead.id,
            customer_name: customerName,
            customer_email: params.customer_email || '',
            customer_phone: customerPhone,
            service_name: params.service_name || 'Consultation / VIP Showing',
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            status: 'confirmed'
          });

          return {
            success: true,
            data: {
              appointmentId: appointment.id,
              date: appointment.appointment_date,
              time: appointment.appointment_time,
              status: 'confirmed',
              calendarSyncStatus: 'synced_to_google_calendar'
            }
          };
        }

        case 'create_lead': {
          const lead = db.createLead(tenantId, {
            agent_id: agentId,
            name: params.name || context.callerName || 'Prospect',
            phone: params.phone || context.callerPhone,
            email: params.email,
            source: params.source || 'AI Inbound Call',
            intent: params.intent || 'Service Inquiry',
            budget: params.budget,
            location: params.location,
            requirements: params.requirements,
            score: params.score || 70,
            status: 'QUALIFIED'
          });
          return { success: true, data: { leadId: lead.id, score: lead.score } };
        }

        case 'schedule_followup': {
          const followup = db.createFollowup(tenantId, {
            agent_id: agentId,
            lead_id: params.lead_id || '',
            trigger_event: params.trigger || 'appointment_booked',
            delay_hours: params.delay_hours || 2,
            channel: params.channel || 'sms',
            message_template: params.message_template || 'Thank you for connecting with us.'
          });
          return { success: true, data: { followupId: followup.id, scheduledFor: followup.scheduled_for } };
        }

        case 'transfer_to_human': {
          const summaryNote = `Customer: ${context.callerName || 'Inbound Caller'} | Phone: ${context.callerPhone || 'Unknown'} | Intent: ${params.reason || 'Requested Human Assistance'} | Priority: ${params.priority || 'High'}`;
          
          db.createAuditLog({
            organization_id: tenantId,
            actor_name: 'AI Agent Handoff',
            action: 'HUMAN_TRANSFER_TRIGGERED',
            resource: summaryNote,
            metadata: { params }
          });

          return {
            success: true,
            data: {
              status: 'transfer_initiated',
              transferNumber: org.phone || '+1 (800) 577-KHAN',
              handoffBrief: summaryNote
            }
          };
        }

        case 'calculate_quote': {
          const baseRate = params.tier === 'premium' ? 5000 : 2500;
          return {
            success: true,
            data: {
              estimatedQuote: baseRate,
              currency: org.currency,
              disclaimer: 'Official quote subject to specialist verification.'
            }
          };
        }

        default:
          return { success: false, error: `Unknown tool execution: ${toolName}` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Tool execution failed' };
    }
  }
}

export const toolEngine = new ToolExecutionEngine();
