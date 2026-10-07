// ============================================================================
// KPS AI Workforce - In-Memory Multi-Tenant Database Store & Data Engine
// Khans Professional Services
// ============================================================================

import type {
  Organization,
  User,
  OrganizationMember,
  Agent,
  AgentVersion,
  AgentToolConfig,
  KnowledgeSource,
  KnowledgeDocument,
  KnowledgeChunk,
  Customer,
  Lead,
  Call,
  CallTranscriptMessage,
  Appointment,
  Followup,
  Integration,
  Plan,
  Subscription,
  UsageRecord,
  Invoice,
  AuditLog,
  SupportTicket,
  ClientHealthOverview
} from '../types/index.ts';

// Default Plans
export const PLANS: Record<string, Plan> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    price_inr: 9999,
    price_usd: 129,
    max_agents: 1,
    voice_minutes_included: 500,
    chat_included: 1000,
    features: [
      '1 Autonomous AI Employee',
      'Inbound Phone Calls & Speech',
      'Embeddable Website Chat',
      'Google Calendar Integration',
      'Lead Qualification & Scoring',
      'Basic CRM & Call Transcripts',
      'Standard Email Notifications'
    ]
  },
  GROWTH: {
    id: 'GROWTH',
    name: 'Growth',
    price_inr: 19999,
    price_usd: 249,
    max_agents: 3,
    voice_minutes_included: 1500,
    chat_included: 3500,
    features: [
      '3 Autonomous AI Employees',
      'Voice & Omnichannel Chat',
      'Smart Lead Scoring (0-100)',
      'Automated Multi-Step Follow-ups',
      'Live Human Handoff with Summaries',
      'Full CRM & Customer Timeline',
      'Advanced Conversion Analytics',
      'Custom Voice Tuning'
    ]
  },
  AGENCY: {
    id: 'AGENCY',
    name: 'Agency Managed',
    price_inr: 39999,
    price_usd: 499,
    max_agents: 10,
    voice_minutes_included: 5000,
    chat_included: 10000,
    features: [
      '10 Autonomous AI Employees',
      'Multiple Business Branches',
      'Custom Knowledge Embeddings',
      'Dedicated Telephony Routing',
      'White-Label Ready Architecture',
      'Webhooks (n8n & Zapier compatible)',
      'Direct KPS Dedicated Engineer',
      '99.9% SLA & Priority Routing'
    ]
  }
};

class DatabaseStore {
  organizations: Map<string, Organization> = new Map();
  users: Map<string, User> = new Map();
  members: Map<string, OrganizationMember> = new Map();
  agents: Map<string, Agent> = new Map();
  agentVersions: Map<string, AgentVersion[]> = new Map(); // agentId -> versions
  agentTools: Map<string, AgentToolConfig[]> = new Map(); // agentId -> tools
  knowledgeSources: Map<string, KnowledgeSource> = new Map();
  knowledgeDocuments: Map<string, KnowledgeDocument> = new Map();
  knowledgeChunks: Map<string, KnowledgeChunk> = new Map();
  customers: Map<string, Customer> = new Map();
  leads: Map<string, Lead> = new Map();
  calls: Map<string, Call> = new Map();
  callTranscripts: Map<string, CallTranscriptMessage[]> = new Map(); // callId -> messages
  appointments: Map<string, Appointment> = new Map();
  followups: Map<string, Followup> = new Map();
  integrations: Map<string, Integration[]> = new Map(); // orgId -> integrations
  subscriptions: Map<string, Subscription> = new Map(); // orgId -> subscription
  usageRecords: Map<string, UsageRecord[]> = new Map(); // orgId -> records
  invoices: Map<string, Invoice[]> = new Map(); // orgId -> invoices
  auditLogs: AuditLog[] = [];
  supportTickets: Map<string, SupportTicket> = new Map();
  processedWebhooks: Map<string, { processed_at: string; result: any }> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Users
    const adminUser: User = {
      id: 'usr_admin_001',
      email: 'azherdadkhan@gmail.com',
      name: 'Azher Dad Khan',
      role: 'platform_owner',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    };
    this.users.set(adminUser.id, adminUser);

    const clientUser1: User = {
      id: 'usr_apex_001',
      email: 'elena@apexrealty.com',
      name: 'Elena Rostova',
      role: 'organization_owner',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    };
    this.users.set(clientUser1.id, clientUser1);

    const clientUser2: User = {
      id: 'usr_dental_001',
      email: 'marcus@radiancedental.com',
      name: 'Dr. Marcus Vance',
      role: 'organization_owner',
      avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    };
    this.users.set(clientUser2.id, clientUser2);

    // 2. Organizations
    const agencyOrg: Organization = {
      id: 'org_kps_agency',
      name: 'Khans Professional Services',
      industry: 'Professional Services',
      website: 'https://kps-workforce.ai',
      phone: '+1 (800) 577-KHAN',
      email: 'agency@kps-workforce.ai',
      address: 'Sky Tower 42, Silicon Valley, CA',
      timezone: 'America/New_York',
      currency: 'USD',
      business_hours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: 'closed'
      },
      status: 'active',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString()
    };
    this.organizations.set(agencyOrg.id, agencyOrg);

    const clientOrg1: Organization = {
      id: 'org_apex_realestate',
      name: 'Apex Luxury Real Estate',
      industry: 'Real Estate',
      website: 'https://apexluxuryproperties.com',
      phone: '+1 (415) 890-7721',
      email: 'concierge@apexluxuryproperties.com',
      address: '740 Park Ave, Manhattan, New York',
      timezone: 'America/New_York',
      currency: 'USD',
      business_hours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: 'closed'
      },
      status: 'active',
      created_at: new Date(Date.now() - 35 * 86400000).toISOString()
    };
    this.organizations.set(clientOrg1.id, clientOrg1);

    const clientOrg2: Organization = {
      id: 'org_radiance_dental',
      name: 'Radiance Dental & Aesthetics',
      industry: 'Clinics & Dental',
      website: 'https://radiancedentalstudio.com',
      phone: '+1 (312) 555-0199',
      email: 'appointments@radiancedentalstudio.com',
      address: '150 N Michigan Ave, Suite 1200, Chicago, IL',
      timezone: 'America/Chicago',
      currency: 'USD',
      business_hours: {
        monday: { open: '08:30', close: '17:30' },
        tuesday: { open: '08:30', close: '17:30' },
        wednesday: { open: '08:30', close: '17:30' },
        thursday: { open: '08:30', close: '17:30' },
        friday: { open: '08:30', close: '16:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: 'closed'
      },
      status: 'active',
      created_at: new Date(Date.now() - 18 * 86400000).toISOString()
    };
    this.organizations.set(clientOrg2.id, clientOrg2);

    // Memberships
    this.members.set('mem_admin', {
      id: 'mem_admin',
      organization_id: agencyOrg.id,
      user_id: adminUser.id,
      role: 'platform_owner',
      permissions: ['all'],
      created_at: agencyOrg.created_at
    });
    this.members.set('mem_apex_owner', {
      id: 'mem_apex_owner',
      organization_id: clientOrg1.id,
      user_id: clientUser1.id,
      role: 'organization_owner',
      permissions: ['org_all'],
      created_at: clientOrg1.created_at
    });
    this.members.set('mem_dental_owner', {
      id: 'mem_dental_owner',
      organization_id: clientOrg2.id,
      user_id: clientUser2.id,
      role: 'organization_owner',
      permissions: ['org_all'],
      created_at: clientOrg2.created_at
    });

    // 3. Subscriptions
    this.subscriptions.set(clientOrg1.id, {
      id: 'sub_apex_growth',
      organization_id: clientOrg1.id,
      plan_id: 'GROWTH',
      status: 'active',
      billing_cycle: 'monthly',
      current_period_start: new Date(Date.now() - 10 * 86400000).toISOString(),
      current_period_end: new Date(Date.now() + 20 * 86400000).toISOString()
    });

    this.subscriptions.set(clientOrg2.id, {
      id: 'sub_dental_starter',
      organization_id: clientOrg2.id,
      plan_id: 'STARTER',
      status: 'active',
      billing_cycle: 'monthly',
      current_period_start: new Date(Date.now() - 15 * 86400000).toISOString(),
      current_period_end: new Date(Date.now() + 15 * 86400000).toISOString()
    });

    // 4. Agents
    const agentApex: Agent = {
      id: 'agt_apex_sarah',
      organization_id: clientOrg1.id,
      name: 'Sarah - Luxury Concierge & Sales',
      type: 'receptionist',
      description: 'Senior AI Front-Desk Receptionist and luxury property lead qualifier. Books VIP showings and answers property inquiries.',
      status: 'active',
      voice_provider: 'retell',
      voice_id: 'voice_alloy',
      language: 'en-US',
      personality: 'Luxury',
      greeting: "Hello, thank you for calling Apex Luxury Real Estate. My name is Sarah. Are you inquiring about one of our exclusive properties or scheduling a private viewing today?",
      system_prompt: `You are Sarah, the elite AI receptionist and sales agent for Apex Luxury Real Estate.
Your mission is to welcome discerning buyers, answer inquiries regarding penthouse suites and luxury estates, qualify their timeline and budget, and book private property viewings.
Maintain an impeccably refined, courteous, and consultative tone.
Never invent property prices or appointment availability. Always consult the verified knowledge base and check calendar slots before committing.
If budget exceeds $3,000,000 or customer insists on speaking with the broker, smoothly schedule an immediate broker handoff.`,
      goals: ['answer_questions', 'capture_leads', 'qualify_leads', 'book_appointments', 'transfer_to_human'],
      business_rules: `1. Always request caller name, phone number, and preferred property location.
2. Confirm buyer representation status (are they already working with an exclusive broker?).
3. Never quote unlisted penthouse prices.
4. Business hours are Monday to Friday 9:00 AM to 6:00 PM EST, Saturday 10:00 AM to 4:00 PM EST.`,
      escalation_rules: {
        human_request: true,
        complaint: true,
        refund: false,
        high_value_lead: true,
        min_confidence_score: 0.75,
        transfer_phone: '+1 (415) 890-7700'
      },
      current_version: 2,
      public_id: 'pub_apex_sarah_99',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
    };
    this.agents.set(agentApex.id, agentApex);

    const agentDental: Agent = {
      id: 'agt_dental_maya',
      organization_id: clientOrg2.id,
      name: 'Maya - Patient Coordinator',
      type: 'receptionist',
      description: 'Clinic AI receptionist handling appointments, dental emergencies, treatment pricing, and pre-visit insurance info.',
      status: 'active',
      voice_provider: 'retell',
      voice_id: 'voice_nova',
      language: 'en-US',
      personality: 'Friendly',
      greeting: "Thank you for calling Radiance Dental & Aesthetics. This is Maya! How may I assist you with your smile today?",
      system_prompt: `You are Maya, warm and compassionate patient coordinator for Radiance Dental & Aesthetics.
Answer patient questions about cleanings, porcelain veneers, teeth whitening, and emergency dental visits.
Gather symptoms, qualify urgent dental pain, check available calendar slots, and secure appointments.
Always confirm caller name, phone, and reason for visit.`,
      goals: ['answer_questions', 'capture_leads', 'book_appointments'],
      business_rules: `1. Emergency toothache callers must be prioritized for same-day triage slot.
2. Teeth whitening package is $450 promotional rate.
3. Confirm patient insurance carrier if available.`,
      escalation_rules: {
        human_request: true,
        complaint: true,
        refund: false,
        high_value_lead: false,
        min_confidence_score: 0.70,
        transfer_phone: '+1 (312) 555-0100'
      },
      current_version: 1,
      public_id: 'pub_dental_maya_42',
      created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
    };
    this.agents.set(agentDental.id, agentDental);

    // Agent Versions
    this.agentVersions.set(agentApex.id, [
      {
        id: 'ver_apex_1',
        agent_id: agentApex.id,
        organization_id: clientOrg1.id,
        version_number: 1,
        config_snapshot: { ...agentApex, personality: 'Professional', greeting: "Hello, welcome to Apex Luxury Real Estate." },
        status: 'archived',
        notes: 'Initial production rollout',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'ver_apex_2',
        agent_id: agentApex.id,
        organization_id: clientOrg1.id,
        version_number: 2,
        config_snapshot: agentApex,
        status: 'published',
        notes: 'Upgraded to Luxury personality preset & added budget qualification rules',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ]);

    // 5. Knowledge Base for Apex
    const srcApexFAQ: KnowledgeSource = {
      id: 'ks_apex_faq',
      organization_id: clientOrg1.id,
      name: 'Apex Luxury Real Estate FAQ & Property Catalog',
      type: 'faq',
      status: 'ready',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      documents_count: 2
    };
    this.knowledgeSources.set(srcApexFAQ.id, srcApexFAQ);

    const docApex1: KnowledgeDocument = {
      id: 'kdoc_apex_1',
      source_id: srcApexFAQ.id,
      organization_id: clientOrg1.id,
      title: 'Current Featured Listings & Requirements',
      content: `PENTHOUSE A - 740 Park Avenue: $8,750,000. 4 Bed, 4.5 Bath. Private elevator, wraparound skyline terrace, Sub-Zero & Gaggenau appliances. Private viewings require 24-hour advance notice and proof of funds.
TRIBECA LOFT - 118 Franklin St: $4,200,000. 3 Bed, 3 Bath. 12-ft timber beam ceilings, key-locked elevator, cast-iron architecture. Available for immediate private walkthrough.
BROKERAGE POLICY: Apex Luxury does not charge buyer consultation fees. All private viewings include a certified luxury real estate specialist and champagne reception.`,
      doc_type: 'txt',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    };
    this.knowledgeDocuments.set(docApex1.id, docApex1);

    const chunkApex1: KnowledgeChunk = {
      id: 'kchk_apex_1',
      document_id: docApex1.id,
      organization_id: clientOrg1.id,
      chunk_text: 'Penthouse A at 740 Park Avenue: $8,750,000. 4 Bed, 4.5 Bath with private elevator and wraparound skyline terrace. Requires 24-hr advance notice.',
      keywords: ['penthouse', '740 park', 'price', 'bedrooms', 'viewing'],
      confidence_threshold: 0.8
    };
    const chunkApex2: KnowledgeChunk = {
      id: 'kchk_apex_2',
      document_id: docApex1.id,
      organization_id: clientOrg1.id,
      chunk_text: 'Tribeca Loft at 118 Franklin St: $4,200,000. 3 Bed, 3 Bath, key-locked elevator. Available for immediate private walkthrough.',
      keywords: ['tribeca', 'loft', 'franklin', 'price', 'viewing'],
      confidence_threshold: 0.8
    };
    this.knowledgeChunks.set(chunkApex1.id, chunkApex1);
    this.knowledgeChunks.set(chunkApex2.id, chunkApex2);

    // 6. Customers & Leads for Apex
    const cust1: Customer = {
      id: 'cust_apex_101',
      organization_id: clientOrg1.id,
      name: 'Harrison Sterling',
      phone: '+1 (212) 555-8912',
      email: 'harrison.sterling@sterlingcapital.com',
      tags: ['High Net Worth', 'Cash Buyer', 'Penthouse Inquiry'],
      total_calls: 3,
      lifetime_value: 8750000,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    };
    this.customers.set(cust1.id, cust1);

    const lead1: Lead = {
      id: 'lead_apex_101',
      organization_id: clientOrg1.id,
      agent_id: agentApex.id,
      customer_id: cust1.id,
      name: 'Harrison Sterling',
      phone: '+1 (212) 555-8912',
      email: 'harrison.sterling@sterlingcapital.com',
      source: 'AI Inbound Call',
      intent: 'Private viewing for 740 Park Ave Penthouse',
      budget: '$8,000,000 - $10,000,000',
      location: 'Upper East Side, Manhattan',
      requirements: '4+ Bedrooms, private terrace, concierge building, cash buyer',
      score: 95,
      status: 'QUALIFIED',
      assigned_to: 'Elena Rostova (Managing Broker)',
      notes: 'AI qualified caller as ultra-high net worth. Verified proof of funds capability. Scheduled VIP private showing.',
      last_contact: new Date(Date.now() - 3600000).toISOString(),
      next_followup: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    };
    this.leads.set(lead1.id, lead1);

    const lead2: Lead = {
      id: 'lead_apex_102',
      organization_id: clientOrg1.id,
      agent_id: agentApex.id,
      name: 'Sophia Chen',
      phone: '+1 (415) 332-9011',
      email: 'schen@horizonai.io',
      source: 'Website Voice Widget',
      intent: 'Relocating from SF to NYC, interested in Tribeca Loft',
      budget: '$4,500,000',
      location: 'Tribeca / Soho',
      requirements: 'High ceilings, home office space for tech executive',
      score: 82,
      status: 'APPOINTMENT',
      assigned_to: 'David Kim',
      notes: 'Confirmed 118 Franklin St walkthrough for Thursday 2:00 PM.',
      last_contact: new Date(Date.now() - 86400000).toISOString(),
      next_followup: new Date(Date.now() + 172800000).toISOString(),
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    };
    this.leads.set(lead2.id, lead2);

    const lead3: Lead = {
      id: 'lead_apex_103',
      organization_id: clientOrg1.id,
      agent_id: agentApex.id,
      name: 'Robert Miller',
      phone: '+1 (917) 441-0082',
      email: 'rmiller@veritas.net',
      source: 'AI Inbound Call',
      intent: 'Inquiry on price trends for Manhattan luxury condos',
      budget: 'Undisclosed',
      location: 'Midtown East',
      requirements: 'Preliminary market research, no immediate purchase planned',
      score: 35,
      status: 'CONTACTED',
      assigned_to: 'Unassigned',
      notes: 'General market questions answered by AI. Enrolled in monthly luxury report sequence.',
      last_contact: new Date(Date.now() - 4 * 86400000).toISOString(),
      next_followup: new Date(Date.now() + 604800000).toISOString(),
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    };
    this.leads.set(lead3.id, lead3);

    // 7. Appointments for Apex
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const appt1: Appointment = {
      id: 'apt_apex_01',
      organization_id: clientOrg1.id,
      agent_id: agentApex.id,
      customer_id: cust1.id,
      lead_id: lead1.id,
      customer_name: 'Harrison Sterling',
      customer_email: 'harrison.sterling@sterlingcapital.com',
      customer_phone: '+1 (212) 555-8912',
      service_name: 'Private VIP Showing - 740 Park Ave Penthouse',
      appointment_date: dateStr,
      appointment_time: '14:00',
      timezone: 'America/New_York',
      status: 'confirmed',
      notes: 'AI booked with proof of funds checklist. Broker Elena attending.',
      created_at: new Date(Date.now() - 40000000).toISOString()
    };
    this.appointments.set(appt1.id, appt1);

    // 8. Calls for Apex
    const call1: Call = {
      id: 'call_apex_001',
      organization_id: clientOrg1.id,
      agent_id: agentApex.id,
      customer_id: cust1.id,
      phone_number: '+1 (212) 555-8912',
      direction: 'inbound',
      provider: 'retell',
      duration_seconds: 245,
      transcript: `Sarah: Hello, thank you for calling Apex Luxury Real Estate. My name is Sarah. Are you inquiring about one of our exclusive properties or scheduling a private viewing today?
Harrison: Yes, hello Sarah. I'm calling about Penthouse A at 740 Park Avenue. Is it still available for purchase?
Sarah: Yes, Penthouse A at 740 Park Avenue is currently available. It is listed at $8,750,000 and features 4 bedrooms, 4.5 bathrooms, a private elevator, and a wraparound skyline terrace. May I know your name and when you would be interested in seeing the residence?
Harrison: My name is Harrison Sterling. I'm available tomorrow afternoon around 2 PM.
Sarah: Wonderful to speak with you, Mr. Sterling. I'd be pleased to coordinate a private viewing for tomorrow at 2:00 PM EST. Could I confirm your email to send the security gate credentials and appointment confirmation?
Harrison: Yes, it's harrison.sterling@sterlingcapital.com.
Sarah: Thank you. I have confirmed your private viewing for tomorrow at 2:00 PM with our managing broker Elena Rostova. You will receive an immediate confirmation on your phone and email. Have a pleasant day!`,
      summary: 'Caller Harrison Sterling inquired regarding Penthouse A ($8.75M) at 740 Park Ave. AI verified availability, captured email & phone, qualified buyer intent, and booked private viewing for tomorrow at 2:00 PM EST.',
      sentiment: 'Positive',
      intent: 'Luxury Penthouse Private Viewing Request',
      lead_score: 95,
      outcome: 'Appointment booked',
      started_at: new Date(Date.now() - 7200000).toISOString(),
      ended_at: new Date(Date.now() - 6955000).toISOString()
    };
    this.calls.set(call1.id, call1);

    // 9. Follow-ups
    const fol1: Followup = {
      id: 'fol_apex_01',
      organization_id: clientOrg1.id,
      lead_id: lead1.id,
      agent_id: agentApex.id,
      trigger_event: 'appointment_confirmed',
      delay_hours: 2,
      channel: 'sms',
      message_template: 'Hi Harrison, this is Sarah from Apex Luxury Real Estate. Your VIP showing at 740 Park Ave is confirmed for tomorrow at 2:00 PM. Please arrive via the private north lobby.',
      status: 'sent',
      scheduled_for: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 7000000).toISOString(),
      lead_name: 'Harrison Sterling'
    };
    this.followups.set(fol1.id, fol1);

    // 10. Integrations
    this.integrations.set(clientOrg1.id, [
      {
        id: 'int_apex_gcal',
        organization_id: clientOrg1.id,
        provider: 'google_calendar',
        name: 'Google Calendar (Broker Sync)',
        description: 'Two-way synchronization for client appointment scheduling and showing slots',
        category: 'Calendar',
        status: 'connected',
        credentials_masked: { account: 'elena@apexrealty.com', calendar_id: 'primary' },
        updated_at: new Date().toISOString()
      },
      {
        id: 'int_apex_retell',
        organization_id: clientOrg1.id,
        provider: 'retell',
        name: 'Retell AI Voice Telephony',
        description: 'Low-latency natural speech engine and SIP trunking for inbound calls',
        category: 'Voice',
        status: 'connected',
        credentials_masked: { api_key: 'retell_live_•••••••89b' },
        updated_at: new Date().toISOString()
      },
      {
        id: 'int_apex_stripe',
        organization_id: clientOrg1.id,
        provider: 'stripe',
        name: 'Stripe SaaS Billing',
        description: 'Automated recurring billing and subscription management',
        category: 'Payments',
        status: 'connected',
        credentials_masked: { customer_id: 'cus_apex_992' },
        updated_at: new Date().toISOString()
      },
      {
        id: 'int_apex_resend',
        organization_id: clientOrg1.id,
        provider: 'resend',
        name: 'Resend Email Gateway',
        description: 'Instant VIP booking confirmations and lead alert notifications',
        category: 'Automation',
        status: 'connected',
        credentials_masked: { domain: 'mail.apexluxuryproperties.com' },
        updated_at: new Date().toISOString()
      }
    ]);

    // 11. Usage Records
    this.usageRecords.set(clientOrg1.id, [
      {
        id: 'usg_apex_1',
        organization_id: clientOrg1.id,
        date: new Date().toISOString().split('T')[0],
        voice_seconds: 22800, // 380 minutes out of 1500 (25.3%)
        calls_count: 87,
        ai_requests: 312,
        token_count: 485000,
        chat_messages: 540,
        sms_count: 48,
        whatsapp_count: 12,
        tool_calls: 198
      }
    ]);

    this.usageRecords.set(clientOrg2.id, [
      {
        id: 'usg_dental_1',
        organization_id: clientOrg2.id,
        date: new Date().toISOString().split('T')[0],
        voice_seconds: 25800, // 430 minutes out of 500 (86% - warning threshold!)
        calls_count: 114,
        ai_requests: 290,
        token_count: 360000,
        chat_messages: 210,
        sms_count: 65,
        whatsapp_count: 0,
        tool_calls: 140
      }
    ]);

    // 12. Invoices
    this.invoices.set(clientOrg1.id, [
      {
        id: 'inv_apex_01',
        organization_id: clientOrg1.id,
        invoice_number: 'INV-KPS-2026-081',
        amount: 249,
        currency: 'USD',
        status: 'paid',
        paid_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        invoice_url: '#',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ]);

    // 13. Audit Logs
    this.auditLogs.push(
      {
        id: 'aud_001',
        organization_id: clientOrg1.id,
        actor_name: 'Elena Rostova',
        action: 'AGENT_PUBLISHED',
        resource: 'Sarah - Luxury Concierge (v2)',
        metadata: { version: 2, changes: 'Tone set to Luxury' },
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'aud_002',
        organization_id: clientOrg1.id,
        actor_name: 'Sarah (AI Agent)',
        action: 'APPOINTMENT_BOOKED',
        resource: 'Harrison Sterling Showing',
        metadata: { date: dateStr, time: '14:00', leadScore: 95 },
        timestamp: new Date(Date.now() - 7000000).toISOString()
      },
      {
        id: 'aud_003',
        organization_id: clientOrg2.id,
        actor_name: 'System Monitor',
        action: 'USAGE_THRESHOLD_ALERT',
        resource: 'Voice Minutes (86%)',
        metadata: { currentMinutes: 430, limitMinutes: 500 },
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    );

    // 14. Support Tickets
    const tkt1: SupportTicket = {
      id: 'tkt_01',
      organization_id: clientOrg2.id,
      user_name: 'Dr. Marcus Vance',
      subject: 'Increase monthly voice minutes before weekend marketing campaign',
      description: 'We are running a local radio campaign this weekend and expect heavy inbound calls. Requesting +500 minute booster pack.',
      priority: 'high',
      status: 'In Progress',
      assigned_staff: 'Azher Dad Khan',
      created_at: new Date(Date.now() - 14400000).toISOString()
    };
    this.supportTickets.set(tkt1.id, tkt1);
  }

  // Multi-tenant Query Engine
  getOrganizations(): Organization[] {
    return Array.from(this.organizations.values());
  }

  getOrganization(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  createOrganization(data: Omit<Organization, 'id' | 'created_at'>): Organization {
    const id = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newOrg: Organization = {
      ...data,
      id,
      created_at: new Date().toISOString()
    };
    this.organizations.set(id, newOrg);

    // Initialize default starter subscription
    this.subscriptions.set(id, {
      id: `sub_${id}`,
      organization_id: id,
      plan_id: 'STARTER',
      status: 'trialing',
      billing_cycle: 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 14 * 86400000).toISOString(),
      trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      trial_calls_remaining: 25
    });

    // Initialize empty usage record
    this.usageRecords.set(id, [{
      id: `usg_${id}`,
      organization_id: id,
      date: new Date().toISOString().split('T')[0],
      voice_seconds: 0,
      calls_count: 0,
      ai_requests: 0,
      token_count: 0,
      chat_messages: 0,
      sms_count: 0,
      whatsapp_count: 0,
      tool_calls: 0
    }]);

    this.createAuditLog({
      organization_id: id,
      actor_name: 'System Provisioning',
      action: 'ORGANIZATION_CREATED',
      resource: newOrg.name,
      metadata: { industry: newOrg.industry }
    });

    return newOrg;
  }

  // Tenant-isolated Agents
  getAgents(tenantId: string, isPlatformOwner = false): Agent[] {
    const list = Array.from(this.agents.values());
    if (isPlatformOwner && !tenantId) return list;
    return list.filter(a => a.organization_id === tenantId);
  }

  getAgent(id: string, tenantId?: string, isPlatformOwner = false): Agent | undefined {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    if (tenantId && !isPlatformOwner && agent.organization_id !== tenantId) {
      return undefined; // Strict tenant boundary
    }
    return agent;
  }

  getAgentByPublicId(publicId: string): Agent | undefined {
    return Array.from(this.agents.values()).find(a => a.public_id === publicId);
  }

  createAgent(tenantId: string, agentData: Partial<Agent>): Agent {
    const id = `agt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const publicId = `pub_${Math.random().toString(36).substring(2, 10)}`;
    const newAgent: Agent = {
      id,
      organization_id: tenantId,
      name: agentData.name || 'AI Receptionist',
      type: agentData.type || 'receptionist',
      description: agentData.description || 'Autonomous AI Employee',
      status: agentData.status || 'active',
      voice_provider: agentData.voice_provider || 'retell',
      voice_id: agentData.voice_id || 'voice_alloy',
      language: agentData.language || 'en-US',
      personality: agentData.personality || 'Professional',
      greeting: agentData.greeting || 'Hello! How may I assist you today?',
      system_prompt: agentData.system_prompt || 'You are an autonomous AI employee.',
      goals: agentData.goals || ['answer_questions', 'capture_leads', 'book_appointments'],
      business_rules: agentData.business_rules || '',
      escalation_rules: agentData.escalation_rules || {
        human_request: true,
        complaint: true,
        refund: false,
        high_value_lead: true,
        min_confidence_score: 0.7
      },
      current_version: 1,
      public_id: publicId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.agents.set(id, newAgent);

    // Create v1 version snapshot
    this.agentVersions.set(id, [{
      id: `ver_${id}_1`,
      agent_id: id,
      organization_id: tenantId,
      version_number: 1,
      config_snapshot: newAgent,
      status: 'published',
      notes: 'Initial configuration',
      created_at: new Date().toISOString()
    }]);

    this.createAuditLog({
      organization_id: tenantId,
      actor_name: 'Business Owner',
      action: 'AGENT_CREATED',
      resource: newAgent.name
    });

    return newAgent;
  }

  updateAgent(id: string, tenantId: string, updates: Partial<Agent>, createNewVersion = false, versionNotes = ''): Agent | null {
    const agent = this.getAgent(id, tenantId);
    if (!agent) return null;

    let newVersionNumber = agent.current_version;
    if (createNewVersion) {
      newVersionNumber = agent.current_version + 1;
    }

    const updatedAgent: Agent = {
      ...agent,
      ...updates,
      current_version: newVersionNumber,
      updated_at: new Date().toISOString()
    };
    this.agents.set(id, updatedAgent);

    if (createNewVersion) {
      const versions = this.agentVersions.get(id) || [];
      versions.push({
        id: `ver_${id}_${newVersionNumber}`,
        agent_id: id,
        organization_id: tenantId,
        version_number: newVersionNumber,
        config_snapshot: updatedAgent,
        status: 'published',
        notes: versionNotes || `Version ${newVersionNumber} published`,
        created_at: new Date().toISOString()
      });
      this.agentVersions.set(id, versions);

      this.createAuditLog({
        organization_id: tenantId,
        actor_name: 'Business Owner',
        action: 'AGENT_VERSION_PUBLISHED',
        resource: `${agent.name} (v${newVersionNumber})`,
        metadata: { notes: versionNotes }
      });
    }

    return updatedAgent;
  }

  rollbackAgentVersion(agentId: string, tenantId: string, targetVersionNumber: number): Agent | null {
    const agent = this.getAgent(agentId, tenantId);
    if (!agent) return null;
    const versions = this.agentVersions.get(agentId) || [];
    const targetVer = versions.find(v => v.version_number === targetVersionNumber);
    if (!targetVer) return null;

    const restoredAgent: Agent = {
      ...agent,
      ...targetVer.config_snapshot,
      current_version: targetVersionNumber,
      updated_at: new Date().toISOString()
    };
    this.agents.set(agentId, restoredAgent);

    this.createAuditLog({
      organization_id: tenantId,
      actor_name: 'Business Owner',
      action: 'AGENT_ROLLED_BACK',
      resource: `${agent.name} restored to v${targetVersionNumber}`
    });

    return restoredAgent;
  }

  getAgentVersions(agentId: string, tenantId: string): AgentVersion[] {
    const versions = this.agentVersions.get(agentId) || [];
    return versions.filter(v => v.organization_id === tenantId);
  }

  // Tenant-isolated Leads
  getLeads(tenantId: string, isPlatformOwner = false): Lead[] {
    const list = Array.from(this.leads.values());
    if (isPlatformOwner && !tenantId) return list.filter(l => !l.deleted_at);
    return list.filter(l => l.organization_id === tenantId && !l.deleted_at)
               .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  softDeleteLead(id: string, tenantId: string): boolean {
    const lead = this.leads.get(id);
    if (!lead || lead.organization_id !== tenantId) return false;
    lead.deleted_at = new Date().toISOString();
    this.createAuditLog({
      organization_id: tenantId,
      actor_name: 'Lead Manager',
      action: 'LEAD_SOFT_DELETED',
      resource: `${lead.name} (${lead.id})`
    });
    return true;
  }

  checkAndRecordWebhookIdempotency(key: string): boolean {
    if (this.processedWebhooks.has(key)) {
      return false; // Replay detected - duplicate event dropped safely
    }
    this.processedWebhooks.set(key, {
      processed_at: new Date().toISOString(),
      result: { status: 'acknowledged' }
    });
    return true;
  }

  createLead(tenantId: string, data: Partial<Lead>): Lead {
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLead: Lead = {
      id,
      organization_id: tenantId,
      agent_id: data.agent_id,
      customer_id: data.customer_id,
      name: data.name || 'Anonymous Prospect',
      phone: data.phone || '',
      email: data.email || '',
      source: data.source || 'AI Inbound Call',
      intent: data.intent || 'General Inquiry',
      budget: data.budget,
      location: data.location,
      requirements: data.requirements,
      score: data.score !== undefined ? data.score : 50,
      status: data.status || 'NEW',
      assigned_to: data.assigned_to,
      notes: data.notes || '',
      last_contact: new Date().toISOString(),
      next_followup: data.next_followup,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.leads.set(id, newLead);

    // Auto trigger follow-up if hot lead
    if (newLead.score >= 70 && newLead.phone) {
      this.createFollowup(tenantId, {
        lead_id: id,
        agent_id: newLead.agent_id,
        trigger_event: 'hot_lead_created',
        delay_hours: 1,
        channel: 'sms',
        message_template: `Hello ${newLead.name}, thank you for speaking with our team today. We have assigned a senior specialist to review your request. Let us know if you need anything right away!`
      });
    }

    this.createAuditLog({
      organization_id: tenantId,
      actor_name: 'AI Agent Engine',
      action: 'LEAD_CAPTURED',
      resource: `${newLead.name} (Score: ${newLead.score})`
    });

    return newLead;
  }

  updateLead(id: string, tenantId: string, updates: Partial<Lead>): Lead | null {
    const lead = this.leads.get(id);
    if (!lead || lead.organization_id !== tenantId) return null;
    const updated = {
      ...lead,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.leads.set(id, updated);
    return updated;
  }

  // Tenant-isolated Calls
  getCalls(tenantId: string, isPlatformOwner = false): Call[] {
    const list = Array.from(this.calls.values());
    if (isPlatformOwner && !tenantId) return list;
    return list.filter(c => c.organization_id === tenantId)
               .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  getCall(id: string, tenantId?: string, isPlatformOwner = false): Call | undefined {
    const call = this.calls.get(id);
    if (!call) return undefined;
    if (tenantId && !isPlatformOwner && call.organization_id !== tenantId) return undefined;
    return call;
  }

  createCall(tenantId: string, callData: Partial<Call>): Call {
    const id = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCall: Call = {
      id,
      organization_id: tenantId,
      agent_id: callData.agent_id || '',
      customer_id: callData.customer_id,
      phone_number: callData.phone_number || '+1 (555) 000-0000',
      direction: callData.direction || 'inbound',
      provider: callData.provider || 'simulator',
      duration_seconds: callData.duration_seconds || 60,
      transcript: callData.transcript || '',
      summary: callData.summary || 'Call processed by AI Agent.',
      sentiment: callData.sentiment || 'Positive',
      intent: callData.intent || 'Customer Inquiry',
      lead_score: callData.lead_score || 60,
      outcome: callData.outcome || 'Qualified',
      started_at: callData.started_at || new Date().toISOString(),
      ended_at: callData.ended_at || new Date().toISOString()
    };
    this.calls.set(id, newCall);

    // Record usage
    this.recordUsage(tenantId, {
      voice_seconds: newCall.duration_seconds,
      calls_count: 1,
      ai_requests: 3,
      token_count: 1200,
      tool_calls: 2
    });

    return newCall;
  }

  // Tenant-isolated Appointments
  getAppointments(tenantId: string, isPlatformOwner = false): Appointment[] {
    const list = Array.from(this.appointments.values());
    if (isPlatformOwner && !tenantId) return list.filter(a => !a.deleted_at);
    return list.filter(a => a.organization_id === tenantId && !a.deleted_at)
               .sort((a, b) => `${a.appointment_date} ${a.appointment_time}`.localeCompare(`${b.appointment_date} ${b.appointment_time}`));
  }

  softDeleteAppointment(id: string, tenantId: string): boolean {
    const appt = this.appointments.get(id);
    if (!appt || appt.organization_id !== tenantId) return false;
    appt.deleted_at = new Date().toISOString();
    appt.status = 'cancelled';
    this.createAuditLog({
      organization_id: tenantId,
      actor_name: 'Calendar Manager',
      action: 'APPOINTMENT_CANCELLED_SOFT_DELETED',
      resource: `${appt.customer_name} (${appt.id})`
    });
    return true;
  }

  createAppointment(tenantId: string, apptData: Partial<Appointment>): Appointment {
    const id = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const org = this.getOrganization(tenantId);
    const newAppt: Appointment = {
      id,
      organization_id: tenantId,
      agent_id: apptData.agent_id,
      customer_id: apptData.customer_id,
      lead_id: apptData.lead_id,
      customer_name: apptData.customer_name || 'Valued Client',
      customer_email: apptData.customer_email || '',
      customer_phone: apptData.customer_phone || '',
      service_name: apptData.service_name || 'Consultation',
      appointment_date: apptData.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: apptData.appointment_time || '10:00',
      timezone: apptData.timezone || org?.timezone || 'America/New_York',
      status: apptData.status || 'confirmed',
      notes: apptData.notes || 'Scheduled via KPS AI Workforce',
      created_at: new Date().toISOString()
    };
    this.appointments.set(id, newAppt);

    this.createAuditLog({
      organization_id: tenantId,
      actor_name: 'AI Appointment Tool',
      action: 'APPOINTMENT_SCHEDULED',
      resource: `${newAppt.customer_name} - ${newAppt.service_name} on ${newAppt.appointment_date} ${newAppt.appointment_time}`
    });

    return newAppt;
  }

  updateAppointment(id: string, tenantId: string, updates: Partial<Appointment>): Appointment | null {
    const appt = this.appointments.get(id);
    if (!appt || appt.organization_id !== tenantId) return null;
    const updated = { ...appt, ...updates };
    this.appointments.set(id, updated);
    return updated;
  }

  // Knowledge Base
  getKnowledgeSources(tenantId: string): KnowledgeSource[] {
    return Array.from(this.knowledgeSources.values()).filter(k => k.organization_id === tenantId);
  }

  getKnowledgeDocuments(tenantId: string): KnowledgeDocument[] {
    return Array.from(this.knowledgeDocuments.values()).filter(d => d.organization_id === tenantId);
  }

  getKnowledgeChunks(tenantId: string): KnowledgeChunk[] {
    return Array.from(this.knowledgeChunks.values()).filter(c => c.organization_id === tenantId);
  }

  createKnowledgeSource(tenantId: string, name: string, type: KnowledgeSource['type'], content: string): KnowledgeSource {
    const srcId = `ks_${Date.now()}`;
    const docId = `kdoc_${Date.now()}`;
    
    const source: KnowledgeSource = {
      id: srcId,
      organization_id: tenantId,
      name,
      type,
      status: 'ready',
      created_at: new Date().toISOString(),
      documents_count: 1
    };
    this.knowledgeSources.set(srcId, source);

    const doc: KnowledgeDocument = {
      id: docId,
      source_id: srcId,
      organization_id: tenantId,
      title: name,
      content,
      doc_type: 'txt',
      created_at: new Date().toISOString()
    };
    this.knowledgeDocuments.set(docId, doc);

    // Split into chunks by paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 10);
    paragraphs.forEach((p, idx) => {
      const chunkId = `kchk_${srcId}_${idx}`;
      const words = p.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      this.knowledgeChunks.set(chunkId, {
        id: chunkId,
        document_id: docId,
        organization_id: tenantId,
        chunk_text: p.trim(),
        keywords: Array.from(new Set(words)).slice(0, 10),
        confidence_threshold: 0.75
      });
    });

    this.createAuditLog({
      organization_id: tenantId,
      actor_name: 'Knowledge Engine',
      action: 'KNOWLEDGE_DOC_INDEXED',
      resource: `${name} (${paragraphs.length} searchable chunks created)`
    });

    return source;
  }

  searchKnowledge(tenantId: string, query: string): { chunk: KnowledgeChunk; score: number }[] {
    const chunks = this.getKnowledgeChunks(tenantId);
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    
    const results: { chunk: KnowledgeChunk; score: number }[] = [];
    for (const chunk of chunks) {
      let matchCount = 0;
      const text = chunk.chunk_text.toLowerCase();
      for (const word of queryWords) {
        if (text.includes(word)) matchCount += 2;
        if (chunk.keywords.includes(word)) matchCount += 1;
      }
      if (matchCount > 0) {
        const score = Math.min(0.99, (matchCount / (queryWords.length * 2)) + 0.3);
        results.push({ chunk, score });
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 4);
  }

  // Follow-ups
  getFollowups(tenantId: string): Followup[] {
    return Array.from(this.followups.values()).filter(f => f.organization_id === tenantId);
  }

  createFollowup(tenantId: string, data: Partial<Followup>): Followup {
    const id = `fol_${Date.now()}`;
    const scheduledFor = new Date(Date.now() + (data.delay_hours || 2) * 3600000).toISOString();
    const lead = data.lead_id ? this.leads.get(data.lead_id) : undefined;
    const item: Followup = {
      id,
      organization_id: tenantId,
      lead_id: data.lead_id || '',
      agent_id: data.agent_id,
      trigger_event: data.trigger_event || 'lead_qualification',
      delay_hours: data.delay_hours || 2,
      channel: data.channel || 'sms',
      message_template: data.message_template || 'Follow up message',
      status: 'scheduled',
      scheduled_for: scheduledFor,
      created_at: new Date().toISOString(),
      lead_name: lead?.name
    };
    this.followups.set(id, item);
    return item;
  }

  // Subscriptions & Billing
  getSubscription(tenantId: string): Subscription | undefined {
    return this.subscriptions.get(tenantId);
  }

  updateSubscription(tenantId: string, planId: 'STARTER' | 'GROWTH' | 'AGENCY', cycle: 'monthly' | 'annual' = 'monthly'): Subscription {
    const current = this.subscriptions.get(tenantId);
    const updated: Subscription = {
      id: current?.id || `sub_${tenantId}`,
      organization_id: tenantId,
      plan_id: planId,
      status: 'active',
      billing_cycle: cycle,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (cycle === 'annual' ? 365 : 30) * 86400000).toISOString()
    };
    this.subscriptions.set(tenantId, updated);

    // Create Invoice
    const plan = PLANS[planId];
    const amount = cycle === 'annual' ? plan.price_usd * 10 : plan.price_usd;
    const invId = `inv_${Date.now()}`;
    const invoices = this.invoices.get(tenantId) || [];
    invoices.unshift({
      id: invId,
      organization_id: tenantId,
      invoice_number: `INV-KPS-2026-${Math.floor(100 + Math.random() * 900)}`,
      amount,
      currency: 'USD',
      status: 'paid',
      paid_at: new Date().toISOString(),
      invoice_url: '#',
      created_at: new Date().toISOString()
    });
    this.invoices.set(tenantId, invoices);

    this.createAuditLog({
      organization_id: tenantId,
      actor_name: 'Billing System',
      action: 'SUBSCRIPTION_UPGRADED',
      resource: `${plan.name} Plan ($${amount})`
    });

    return updated;
  }

  getInvoices(tenantId: string): Invoice[] {
    return this.invoices.get(tenantId) || [];
  }

  // Usage Metering
  getUsageRecords(tenantId: string): UsageRecord[] {
    return this.usageRecords.get(tenantId) || [];
  }

  recordUsage(tenantId: string, delta: Partial<UsageRecord>) {
    const today = new Date().toISOString().split('T')[0];
    const records = this.usageRecords.get(tenantId) || [];
    let todayRecord = records.find(r => r.date === today);
    if (!todayRecord) {
      todayRecord = {
        id: `usg_${Date.now()}`,
        organization_id: tenantId,
        date: today,
        voice_seconds: 0,
        calls_count: 0,
        ai_requests: 0,
        token_count: 0,
        chat_messages: 0,
        sms_count: 0,
        whatsapp_count: 0,
        tool_calls: 0
      };
      records.unshift(todayRecord);
      this.usageRecords.set(tenantId, records);
    }
    todayRecord.voice_seconds += delta.voice_seconds || 0;
    todayRecord.calls_count += delta.calls_count || 0;
    todayRecord.ai_requests += delta.ai_requests || 0;
    todayRecord.token_count += delta.token_count || 0;
    todayRecord.chat_messages += delta.chat_messages || 0;
    todayRecord.sms_count += delta.sms_count || 0;
    todayRecord.whatsapp_count += delta.whatsapp_count || 0;
    todayRecord.tool_calls += delta.tool_calls || 0;
  }

  // Integrations
  getIntegrations(tenantId: string): Integration[] {
    return this.integrations.get(tenantId) || [
      {
        id: `int_${tenantId}_gcal`,
        organization_id: tenantId,
        provider: 'google_calendar',
        name: 'Google Calendar',
        description: 'Sync appointment availability and calendar booking',
        category: 'Calendar',
        status: 'not_connected',
        updated_at: new Date().toISOString()
      },
      {
        id: `int_${tenantId}_retell`,
        organization_id: tenantId,
        provider: 'retell',
        name: 'Retell AI Telephony',
        description: 'Low-latency natural speech engine and phone SIP routing',
        category: 'Voice',
        status: 'not_connected',
        updated_at: new Date().toISOString()
      },
      {
        id: `int_${tenantId}_vapi`,
        organization_id: tenantId,
        provider: 'vapi',
        name: 'Vapi Voice Engine',
        description: 'Alternative voice orchestrator and phone provider',
        category: 'Voice',
        status: 'not_connected',
        updated_at: new Date().toISOString()
      },
      {
        id: `int_${tenantId}_twilio`,
        organization_id: tenantId,
        provider: 'twilio',
        name: 'Twilio SMS & Phone Carrier',
        description: 'Provision direct business DID numbers and send follow-up SMS',
        category: 'Telephony',
        status: 'not_connected',
        updated_at: new Date().toISOString()
      },
      {
        id: `int_${tenantId}_stripe`,
        organization_id: tenantId,
        provider: 'stripe',
        name: 'Stripe International Billing',
        description: 'Credit card subscription and usage billing',
        category: 'Payments',
        status: 'not_connected',
        updated_at: new Date().toISOString()
      },
      {
        id: `int_${tenantId}_razorpay`,
        organization_id: tenantId,
        provider: 'razorpay',
        name: 'Razorpay (India)',
        description: 'UPI and Indian net banking subscriptions',
        category: 'Payments',
        status: 'not_connected',
        updated_at: new Date().toISOString()
      },
      {
        id: `int_${tenantId}_n8n`,
        organization_id: tenantId,
        provider: 'n8n',
        name: 'n8n Automation Webhooks',
        description: 'Trigger autonomous backend flows and custom CRM synchronizations',
        category: 'Automation',
        status: 'not_connected',
        updated_at: new Date().toISOString()
      }
    ];
  }

  updateIntegration(tenantId: string, provider: Integration['provider'], updates: Partial<Integration>): Integration {
    let list = this.getIntegrations(tenantId);
    const idx = list.findIndex(i => i.provider === provider);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    } else {
      const newItem: Integration = {
        id: `int_${Date.now()}`,
        organization_id: tenantId,
        provider,
        name: provider,
        description: 'Integration provider',
        category: 'Automation',
        status: 'connected',
        updated_at: new Date().toISOString(),
        ...updates
      };
      list.push(newItem);
    }
    this.integrations.set(tenantId, list);
    return list.find(i => i.provider === provider)!;
  }

  // Audit Logs
  createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    this.auditLogs.unshift({
      ...log,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString()
    });
    // keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  getAuditLogs(tenantId?: string, isPlatformOwner = false): AuditLog[] {
    if (isPlatformOwner && !tenantId) return this.auditLogs;
    return this.auditLogs.filter(a => a.organization_id === tenantId);
  }

  // Agency Admin Platform Insights
  getAgencyClientsOverview(): ClientHealthOverview[] {
    const clients: ClientHealthOverview[] = [];
    for (const org of this.organizations.values()) {
      if (org.id === 'org_kps_agency') continue; // Skip agency itself

      const sub = this.subscriptions.get(org.id) || {
        id: `sub_${org.id}`,
        organization_id: org.id,
        plan_id: 'STARTER',
        status: 'trialing',
        billing_cycle: 'monthly',
        current_period_start: org.created_at,
        current_period_end: new Date().toISOString()
      };
      const plan = PLANS[sub.plan_id] || PLANS.STARTER;
      const agents = this.getAgents(org.id);
      const usage = this.getUsageRecords(org.id)[0];
      const usedSeconds = usage?.voice_seconds || 0;
      const usedMinutes = Math.round(usedSeconds / 60);
      const limitMinutes = plan.voice_minutes_included;

      // Health Calculation
      let health: 'green' | 'yellow' | 'red' = 'green';
      let healthReason = 'All AI employees operating at 100% capacity';

      if (org.status === 'suspended') {
        health = 'red';
        healthReason = 'Account suspended by agency administrator';
      } else if (usedMinutes >= limitMinutes * 0.9) {
        health = 'yellow';
        healthReason = `Voice quota at ${Math.round((usedMinutes / limitMinutes) * 100)}% of monthly capacity`;
      } else if (agents.length === 0) {
        health = 'yellow';
        healthReason = 'Onboarding incomplete: no AI employee deployed';
      }

      clients.push({
        organization: org,
        subscription: sub,
        plan,
        agent_count: agents.length,
        monthly_revenue: plan.price_usd,
        health,
        health_reason: healthReason,
        usage_minutes: usedMinutes,
        last_activity: '12 minutes ago'
      });
    }
    return clients;
  }
}

export const db = new DatabaseStore();
