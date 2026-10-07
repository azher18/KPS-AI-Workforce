-- ============================================================================
-- KPS AI Workforce - Database Schema & Supabase RLS Migration
-- Khans Professional Services - Multi-Tenant AI Agency SaaS Platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS (TENANTS)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    currency VARCHAR(10) DEFAULT 'USD',
    logo_url TEXT,
    business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "10:00", "close": "15:00"}, "sunday": "closed"}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'suspended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS & MEMBERSHIPS (MULTI-TENANT RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('platform_owner', 'agency_staff', 'organization_owner', 'organization_member')),
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

-- 3. AI AGENTS
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('receptionist', 'sales', 'qualification', 'appointment', 'support', 'followup')),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'paused')),
    voice_provider VARCHAR(50) DEFAULT 'retell' CHECK (voice_provider IN ('retell', 'vapi', 'elevenlabs', 'simulator')),
    voice_id VARCHAR(100) DEFAULT 'voice_alloy',
    language VARCHAR(20) DEFAULT 'en-US',
    personality VARCHAR(50) DEFAULT 'Professional' CHECK (personality IN ('Professional', 'Friendly', 'Luxury', 'Casual', 'Energetic', 'Consultative')),
    greeting TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    goals JSONB DEFAULT '["answer_questions", "capture_leads", "qualify_leads", "book_appointments"]'::jsonb,
    business_rules TEXT,
    escalation_rules JSONB DEFAULT '{"human_request": true, "complaint": true, "refund": true, "high_value_lead": true, "min_confidence_score": 0.7}'::jsonb,
    current_version INT DEFAULT 1,
    public_id VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AGENT VERSIONS (AUDITABLE ROLLBACK SYSTEM)
CREATE TABLE agent_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    config_snapshot JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (agent_id, version_number)
);

-- 5. AGENT TOOLS
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    UNIQUE (agent_id, tool_name)
);

-- 6. KNOWLEDGE BASE
CREATE TABLE knowledge_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('faq', 'url', 'document', 'policy', 'service_pricing')),
    status VARCHAR(50) DEFAULT 'ready' CHECK (status IN ('processing', 'ready', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    doc_type VARCHAR(50) DEFAULT 'txt',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    keywords TEXT[],
    confidence_threshold NUMERIC(3, 2) DEFAULT 0.75,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 7. CUSTOMERS & LEADS CRM
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    total_calls INT DEFAULT 0,
    lifetime_value NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(100) DEFAULT 'AI Inbound Call',
    intent TEXT,
    budget VARCHAR(100),
    location VARCHAR(255),
    requirements TEXT,
    score INT DEFAULT 50 CHECK (score >= 0 AND score <= 100),
    status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT', 'NEGOTIATION', 'CONVERTED', 'LOST')),
    assigned_to VARCHAR(255),
    notes TEXT,
    last_contact TIMESTAMPTZ DEFAULT NOW(),
    next_followup TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CALLS & TELEPHONY LOGS
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    phone_number VARCHAR(50) NOT NULL,
    direction VARCHAR(20) DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
    provider VARCHAR(50) DEFAULT 'simulator' CHECK (provider IN ('retell', 'vapi', 'twilio', 'simulator')),
    duration_seconds INT DEFAULT 0,
    transcript TEXT,
    summary TEXT,
    sentiment VARCHAR(50) DEFAULT 'Positive',
    intent VARCHAR(255),
    lead_score INT DEFAULT 0,
    outcome VARCHAR(100) DEFAULT 'Qualified' CHECK (outcome IN ('Qualified', 'Appointment booked', 'Information requested', 'Human transfer', 'Not interested', 'Failed')),
    recording_url TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    speaker VARCHAR(50) NOT NULL CHECK (speaker IN ('agent', 'customer', 'system')),
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    tool_call JSONB
);

-- 9. APPOINTMENTS (GOOGLE CALENDAR INTEGRATED)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    service_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FOLLOW-UPS & AUTOMATIONS
CREATE TABLE followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    trigger_event VARCHAR(100) NOT NULL,
    delay_hours INT DEFAULT 2,
    channel VARCHAR(50) DEFAULT 'sms' CHECK (channel IN ('sms', 'email', 'whatsapp')),
    message_template TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'replied')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    event_trigger VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INTEGRATIONS
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_connected' CHECK (status IN ('connected', 'not_connected', 'error')),
    credentials_masked JSONB DEFAULT '{}'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (organization_id, provider)
);

-- 12. SUBSCRIPTIONS, PLANS & USAGE
CREATE TABLE plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_inr INT NOT NULL,
    price_usd INT NOT NULL,
    max_agents INT NOT NULL,
    voice_minutes_included INT NOT NULL,
    chat_included INT NOT NULL,
    features JSONB NOT NULL
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES plans(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    trial_ends_at TIMESTAMPTZ,
    razorpay_subscription_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100)
);

CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    voice_seconds INT DEFAULT 0,
    calls_count INT DEFAULT 0,
    ai_requests INT DEFAULT 0,
    token_count INT DEFAULT 0,
    chat_messages INT DEFAULT 0,
    sms_count INT DEFAULT 0,
    whatsapp_count INT DEFAULT 0,
    tool_calls INT DEFAULT 0,
    UNIQUE (organization_id, date)
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS, NOTIFICATIONS & TICKETS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID,
    actor_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system' CHECK (type IN ('hot_lead', 'appointment', 'usage_warning', 'transfer_request', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Waiting', 'Resolved')),
    assigned_staff VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Isolation Enforcement
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is platform_owner
CREATE OR REPLACE FUNCTION is_platform_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid() AND role = 'platform_owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organization isolation policy macro: Users can only select/modify data belonging to their organization
CREATE POLICY "Tenant isolation for agents" ON agents
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        ) OR is_platform_owner()
    );

CREATE POLICY "Tenant isolation for leads" ON leads
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        ) OR is_platform_owner()
    );

CREATE POLICY "Tenant isolation for calls" ON calls
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        ) OR is_platform_owner()
    );

CREATE POLICY "Tenant isolation for appointments" ON appointments
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        ) OR is_platform_owner()
    );

CREATE POLICY "Tenant isolation for knowledge" ON knowledge_sources
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        ) OR is_platform_owner()
    );
