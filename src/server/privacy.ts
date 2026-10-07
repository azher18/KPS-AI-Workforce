// ============================================================================
// KPS AI Workforce - Privacy, Recording Consent & Data Lifecycle Engine
// Sections 38, 39, 46, 47 & 48 of PRD V2
// ============================================================================

import { db } from './db.ts';

export interface PrivacySettings {
  organization_id: string;
  call_recording_enabled: boolean;
  ai_disclosure_enabled: boolean;
  disclosure_message: string;
  transcript_retention_days: number;
  pii_masking_enabled: boolean;
}

class PrivacyService {
  private settings: Map<string, PrivacySettings> = new Map();

  constructor() {
    // Seed default settings for demo tenants
    this.settings.set('org_apex_realestate', {
      organization_id: 'org_apex_realestate',
      call_recording_enabled: true,
      ai_disclosure_enabled: true,
      disclosure_message: 'This call is assisted by an autonomous AI representative for quality and training purposes.',
      transcript_retention_days: 90,
      pii_masking_enabled: true
    });
    this.settings.set('org_radiance_dental', {
      organization_id: 'org_radiance_dental',
      call_recording_enabled: true,
      ai_disclosure_enabled: true,
      disclosure_message: 'Thank you for calling. This consultation call is recorded and assisted by an AI coordinator.',
      transcript_retention_days: 180,
      pii_masking_enabled: true
    });
  }

  getSettings(tenantId: string): PrivacySettings {
    if (!this.settings.has(tenantId)) {
      this.settings.set(tenantId, {
        organization_id: tenantId,
        call_recording_enabled: true,
        ai_disclosure_enabled: true,
        disclosure_message: 'This call may be recorded and processed by an autonomous AI employee.',
        transcript_retention_days: 90,
        pii_masking_enabled: true
      });
    }
    return this.settings.get(tenantId)!;
  }

  updateSettings(tenantId: string, updates: Partial<PrivacySettings>): PrivacySettings {
    const current = this.getSettings(tenantId);
    const updated = { ...current, ...updates, organization_id: tenantId };
    this.settings.set(tenantId, updated);

    db.createAuditLog({
      organization_id: tenantId,
      actor_name: 'Privacy Officer',
      action: 'PRIVACY_POLICY_UPDATED',
      resource: 'Recording & AI Disclosure Policy'
    });

    return updated;
  }

  deleteCustomerData(tenantId: string, customerId: string): boolean {
    const customer = db.customers.get(customerId);
    if (!customer || customer.organization_id !== tenantId) return false;

    // Redact PII in place
    customer.name = '[REDACTED USER]';
    customer.phone = '+1 (000) 000-0000';
    customer.email = 'redacted@privacy.gdpr';
    customer.tags = ['DELETED'];

    // Redact matching leads
    const leads = db.getLeads(tenantId);
    leads.forEach(l => {
      if (l.customer_id === customerId) {
        l.name = '[REDACTED]';
        l.phone = '';
        l.email = '';
        l.notes = 'PII purged upon verified customer data deletion request.';
      }
    });

    db.createAuditLog({
      organization_id: tenantId,
      actor_name: 'Customer Deletion Workflow',
      action: 'CUSTOMER_PII_PURGED',
      resource: `Customer ID: ${customerId}`
    });

    return true;
  }
}

export const privacyService = new PrivacyService();
