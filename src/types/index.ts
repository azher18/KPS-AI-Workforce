// ============================================================================
// KPS AI Workforce - TypeScript Type Definitions
// Khans Professional Services - Multi-Tenant AI Agency SaaS Platform
// ============================================================================

export type Role = 'platform_owner' | 'agency_staff' | 'organization_owner' | 'organization_member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface BusinessHours {
  monday: { open: string; close: string };
  tuesday: { open: string; close: string };
  wednesday: { open: string; close: string };
  thursday: { open: string; close: string };
  friday: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  currency: string;
  logo_url?: string;
  business_hours: BusinessHours;
  status: 'active' | 'trialing' | 'suspended' | 'cancelled';
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: Role;
  permissions: string[];
  created_at: string;
  user?: User;
}

export type AgentType = 
  | 'receptionist' 
  | 'sales' 
  | 'qualification' 
  | 'appointment' 
  | 'support' 
  | 'followup';

export type Personality = 
  | 'Professional' 
  | 'Friendly' 
  | 'Luxury' 
  | 'Casual' 
  | 'Energetic' 
  | 'Consultative';

export interface EscalationRules {
  human_request: boolean;
  complaint: boolean;
  refund: boolean;
  high_value_lead: boolean;
  min_confidence_score: number;
  transfer_phone?: string;
}

export interface Agent {
  id: string;
  organization_id: string;
  name: string;
  type: AgentType;
  description: string;
  status: 'active' | 'draft' | 'paused';
  voice_provider: 'retell' | 'vapi' | 'elevenlabs' | 'simulator';
  voice_id: string;
  language: string;
  personality: Personality;
  greeting: string;
  system_prompt: string;
  goals: string[];
  business_rules: string;
  escalation_rules: EscalationRules;
  current_version: number;
  public_id: string;
  created_at: string;
  updated_at: string;
}

export interface AgentVersion {
  id: string;
  agent_id: string;
  organization_id: string;
  version_number: number;
  config_snapshot: Partial<Agent>;
  status: 'draft' | 'published' | 'archived';
  notes: string;
  created_at: string;
}

export interface AgentToolConfig {
  id: string;
  agent_id: string;
  organization_id: string;
  tool_name: string;
  is_enabled: boolean;
  config: Record<string, any>;
}

export interface KnowledgeSource {
  id: string;
  organization_id: string;
  name: string;
  type: 'faq' | 'url' | 'document' | 'policy' | 'service_pricing';
  status: 'processing' | 'ready' | 'failed';
  created_at: string;
  documents_count?: number;
}

export interface KnowledgeDocument {
  id: string;
  source_id: string;
  organization_id: string;
  title: string;
  content: string;
  doc_type: string;
  created_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  organization_id: string;
  chunk_text: string;
  keywords: string[];
  confidence_threshold: number;
  metadata?: Record<string, any>;
}

export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  total_calls: number;
  lifetime_value: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'QUALIFIED' 
  | 'APPOINTMENT' 
  | 'NEGOTIATION' 
  | 'CONVERTED' 
  | 'LOST';

export interface Lead {
  id: string;
  organization_id: string;
  agent_id?: string;
  customer_id?: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  intent: string;
  budget?: string;
  location?: string;
  requirements?: string;
  score: number; // 0-100
  status: LeadStatus;
  assigned_to?: string;
  notes?: string;
  last_contact: string;
  next_followup?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type CallOutcome = 
  | 'Qualified' 
  | 'Appointment booked' 
  | 'Information requested' 
  | 'Human transfer' 
  | 'Not interested' 
  | 'Failed';

export interface Call {
  id: string;
  organization_id: string;
  agent_id: string;
  customer_id?: string;
  phone_number: string;
  direction: 'inbound' | 'outbound';
  provider: 'retell' | 'vapi' | 'twilio' | 'elevenlabs' | 'simulator';
  duration_seconds: number;
  transcript: string;
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  intent: string;
  lead_score: number;
  outcome: CallOutcome;
  recording_url?: string;
  started_at: string;
  ended_at?: string;
}

export interface CallTranscriptMessage {
  id: string;
  call_id: string;
  speaker: 'agent' | 'customer' | 'system';
  message: string;
  timestamp: string;
  tool_call?: {
    name: string;
    params?: any;
    result?: any;
  };
}

export interface Appointment {
  id: string;
  organization_id: string;
  agent_id?: string;
  customer_id?: string;
  lead_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  timezone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  created_at: string;
  deleted_at?: string;
}

export interface Followup {
  id: string;
  organization_id: string;
  lead_id: string;
  agent_id?: string;
  trigger_event: string;
  delay_hours: number;
  channel: 'sms' | 'email' | 'whatsapp';
  message_template: string;
  status: 'scheduled' | 'sent' | 'cancelled' | 'replied';
  scheduled_for: string;
  created_at: string;
  lead_name?: string;
}

export interface Integration {
  id: string;
  organization_id: string;
  provider: 'google_calendar' | 'twilio' | 'retell' | 'vapi' | 'stripe' | 'razorpay' | 'resend' | 'n8n';
  name: string;
  description: string;
  category: 'Voice' | 'Calendar' | 'Telephony' | 'Payments' | 'Automation';
  status: 'connected' | 'not_connected' | 'error';
  credentials_masked?: Record<string, string>;
  config?: Record<string, any>;
  updated_at: string;
}

export interface Plan {
  id: 'STARTER' | 'GROWTH' | 'AGENCY';
  name: string;
  price_inr: number;
  price_usd: number;
  max_agents: number;
  voice_minutes_included: number;
  chat_included: number;
  features: string[];
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: 'STARTER' | 'GROWTH' | 'AGENCY';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  billing_cycle: 'monthly' | 'annual';
  current_period_start: string;
  current_period_end: string;
  trial_ends_at?: string;
  trial_calls_remaining?: number;
}

export interface UsageRecord {
  id: string;
  organization_id: string;
  date: string;
  voice_seconds: number;
  calls_count: number;
  ai_requests: number;
  token_count: number;
  chat_messages: number;
  sms_count: number;
  whatsapp_count: number;
  tool_calls: number;
}

export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  paid_at?: string;
  invoice_url?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_id?: string;
  actor_name: string;
  action: string;
  resource: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  organization_id: string;
  user_name: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved';
  assigned_staff?: string;
  created_at: string;
}

export interface ClientHealthOverview {
  organization: Organization;
  subscription: Subscription;
  plan: Plan;
  agent_count: number;
  monthly_revenue: number;
  health: 'green' | 'yellow' | 'red';
  health_reason: string;
  usage_minutes: number;
  last_activity: string;
}

// Provider Interfaces
export interface AIProvider {
  generateResponse(params: {
    agent: Agent;
    conversationHistory: { speaker: string; message: string }[];
    customerMessage: string;
    knowledgeContext: string[];
    availableTools: string[];
  }): Promise<{
    message: string;
    toolCall?: { name: string; params: any };
    confidence: number;
    reasoningSummary?: string;
  }>;
  
  classifyIntent(message: string): Promise<string>;
  summarizeConversation(transcript: string): Promise<{
    summary: string;
    intent: string;
    leadScore: number;
    recommendedAction: string;
    outcome: CallOutcome;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
  }>;
  scoreLead(leadData: Partial<Lead>, transcript?: string): Promise<number>;
}

export interface VoiceProvider {
  createAgent(agent: Agent): Promise<{ providerAgentId: string }>;
  updateAgent(agent: Agent): Promise<boolean>;
  getCallTranscript(callId: string): Promise<string>;
  transferCall(callId: string, targetNumber: string): Promise<{ success: boolean; reason?: string }>;
}
