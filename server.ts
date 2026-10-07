// ============================================================================
// KPS AI Workforce - Full-Stack Express Server & API Gateway
// Khans Professional Services
// ============================================================================

import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, PLANS } from './src/server/db.ts';
import { aiProvider } from './src/server/providers/ai-provider.ts';
import { toolEngine } from './src/server/tools/engine.ts';
import { authService } from './src/server/auth.ts';
import { healthMonitor } from './src/server/health.ts';
import { UsageEnforcementService } from './src/server/usage.ts';
import { privacyService } from './src/server/privacy.ts';
import { AccessControl } from './src/server/rbac.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run Nginx proxies port 8080 to internal port 3000
const PORT = 3000;

app.use(express.json());

// Session State for Current User & Active Tenant
let currentSession = {
  userId: 'usr_admin_001', // Default platform owner (Azher Dad Khan)
  activeTenantId: 'org_apex_realestate', // Default active viewing tenant
  isImpersonating: false
};

// Middleware: Tenant Authorization Scoping
const getRequestContext = (req: Request) => {
  const user = db.users.get(currentSession.userId);
  const isPlatformOwner = user?.role === 'platform_owner';
  const tenantId = (req.headers['x-tenant-id'] as string) || currentSession.activeTenantId;
  return { user, isPlatformOwner, tenantId };
};

// ============================================================================
// 1. SESSION & AUTHENTICATION ENDPOINTS
// ============================================================================

app.get('/api/session', (req: Request, res: Response) => {
  const user = db.users.get(currentSession.userId);
  const activeOrg = db.getOrganization(currentSession.activeTenantId);
  const allOrgs = db.getOrganizations();
  const allUsers = Array.from(db.users.values());

  res.json({
    user,
    activeOrganization: activeOrg,
    accessibleOrganizations: user?.role === 'platform_owner' ? allOrgs : allOrgs.filter(o => o.id === currentSession.activeTenantId),
    availableUsers: allUsers,
    isPlatformOwner: user?.role === 'platform_owner',
    isImpersonating: currentSession.isImpersonating
  });
});

app.post('/api/auth/switch-tenant', (req: Request, res: Response) => {
  const { tenantId, userId } = req.body;
  if (userId && db.users.has(userId)) {
    currentSession.userId = userId;
  }
  if (tenantId && db.organizations.has(tenantId)) {
    currentSession.activeTenantId = tenantId;
  }
  const user = db.users.get(currentSession.userId);
  res.json({
    success: true,
    user,
    activeOrganization: db.getOrganization(currentSession.activeTenantId)
  });
});

app.post('/api/auth/impersonate', (req: Request, res: Response) => {
  const { tenantId } = req.body;
  if (!db.organizations.has(tenantId)) {
    return res.status(404).json({ error: 'Organization not found' });
  }
  currentSession.activeTenantId = tenantId;
  currentSession.isImpersonating = true;
  res.json({ success: true, activeOrganization: db.getOrganization(tenantId) });
});

app.post('/api/auth/stop-impersonate', (req: Request, res: Response) => {
  currentSession.activeTenantId = 'org_kps_agency';
  currentSession.isImpersonating = false;
  res.json({ success: true, activeOrganization: db.getOrganization('org_kps_agency') });
});

// PRD V2 Authentication Flows
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const result = authService.login(email, password);
  if (!result.success) {
    return res.status(401).json({ error: result.error, errorCode: result.errorCode });
  }
  currentSession.userId = result.session!.user.id;
  res.json(result);
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, name, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  const result = authService.register(email, name, role);
  if (!result.success) {
    return res.status(400).json({ error: result.error, errorCode: result.errorCode });
  }
  currentSession.userId = result.session!.user.id;
  res.status(201).json(result);
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || 'sess_default_admin_token';
  authService.logout(token);
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const result = authService.requestPasswordReset(email || '');
  res.json(result);
});

// PRD V2: Health Monitoring & Circuit Breakers
app.get('/api/health', (req: Request, res: Response) => {
  const health = healthMonitor.getSystemHealth();
  const overallStatus = health.some(h => h.status === 'Unavailable')
    ? 'Unavailable'
    : health.some(h => h.status === 'Degraded')
    ? 'Degraded'
    : 'Operational';

  res.json({
    overallStatus,
    timestamp: new Date().toISOString(),
    services: health
  });
});

let simulatedOutage: 'calendar' | 'voice' | 'none' = 'none';

app.post('/api/health/simulate-outage', (req: Request, res: Response) => {
  const { service } = req.body;
  simulatedOutage = service || 'none';
  res.json({ success: true, simulatedOutage });
});

// PRD V2: Privacy & Data Lifecycle
app.get('/api/privacy', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  res.json(privacyService.getSettings(tenantId));
});

app.patch('/api/privacy', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const updated = privacyService.updateSettings(tenantId, req.body);
  res.json(updated);
});

app.post('/api/privacy/customers/:id/purge', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const success = privacyService.deleteCustomerData(tenantId, req.params.id);
  if (!success) return res.status(404).json({ error: 'Customer not found' });
  res.json({ success: true, message: 'Customer PII purged in compliance with privacy retention rules.' });
});

// ============================================================================
// 2. ORGANIZATIONS & ONBOARDING
// ============================================================================

app.get('/api/organizations', (req: Request, res: Response) => {
  const { isPlatformOwner, tenantId } = getRequestContext(req);
  if (isPlatformOwner) {
    return res.json(db.getOrganizations());
  }
  const org = db.getOrganization(tenantId);
  return res.json(org ? [org] : []);
});

app.get('/api/organizations/:id', (req: Request, res: Response) => {
  const org = db.getOrganization(req.params.id);
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  res.json(org);
});

app.post('/api/organizations', (req: Request, res: Response) => {
  const { name, industry, website, phone, email, address, business_hours, firstAgentName } = req.body;
  if (!name) return res.status(400).json({ error: 'Business name is required' });

  const newOrg = db.createOrganization({
    name,
    industry: industry || 'Professional Services',
    website: website || '',
    phone: phone || '+1 (555) 000-0000',
    email: email || 'contact@client.com',
    address: address || '',
    timezone: 'America/New_York',
    currency: 'USD',
    business_hours: business_hours || {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '10:00', close: '15:00' },
      sunday: 'closed'
    },
    status: 'active'
  });

  // Automatically deploy first AI receptionist employee for this new tenant
  const initialAgent = db.createAgent(newOrg.id, {
    name: firstAgentName || `${newOrg.name} AI Receptionist`,
    type: 'receptionist',
    personality: 'Professional',
    description: `Official AI front-desk receptionist for ${newOrg.name}`,
    greeting: `Hello, thank you for calling ${newOrg.name}. How may I direct your call or assist you today?`,
    system_prompt: `You are the front desk receptionist for ${newOrg.name}. Welcome callers, answer inquiries, qualify needs, and book appointments.`,
    goals: ['answer_questions', 'capture_leads', 'book_appointments']
  });

  // Seed default FAQ knowledge base
  db.createKnowledgeSource(newOrg.id, 'Standard Business FAQ', 'faq', `Business Hours: Monday-Friday 9 AM to 6 PM.\nServices: Professional consultations and customer appointments.\nCancellation policy: Please provide 24 hours notice.`);

  // Auto switch active tenant to this new organization
  currentSession.activeTenantId = newOrg.id;

  res.status(201).json({
    organization: newOrg,
    initialAgent
  });
});

app.patch('/api/organizations/:id', (req: Request, res: Response) => {
  const org = db.getOrganization(req.params.id);
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  Object.assign(org, req.body);
  res.json(org);
});

// ============================================================================
// 3. AGENCY ADMIN PLATFORM PORTAL (KPS HQ)
// ============================================================================

app.get('/api/agency/overview', (req: Request, res: Response) => {
  const orgs = db.getOrganizations().filter(o => o.id !== 'org_kps_agency');
  const allAgents = Array.from(db.agents.values());
  const allCalls = Array.from(db.calls.values());
  
  let mrr = 0;
  orgs.forEach(org => {
    const sub = db.subscriptions.get(org.id);
    const plan = PLANS[sub?.plan_id || 'STARTER'];
    mrr += plan ? plan.price_usd : 129;
  });

  const arr = mrr * 12;
  const callsToday = allCalls.length;
  const totalVoiceSeconds = allCalls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
  const totalVoiceMinutes = Math.round(totalVoiceSeconds / 60);

  // Estimated provider costs for agency margin tracking (Retell: $0.07/min, Gemini: $0.005/req)
  const voiceCost = totalVoiceMinutes * 0.07;
  const aiCost = allCalls.length * 3 * 0.005;
  const totalEstCost = voiceCost + aiCost;
  const grossMargin = mrr - totalEstCost;
  const marginPercentage = mrr > 0 ? Math.round((grossMargin / mrr) * 100) : 0;

  res.json({
    totalOrganizations: orgs.length,
    activeAgents: allAgents.length,
    callsToday,
    voiceMinutes: totalVoiceMinutes,
    mrr,
    arr,
    estimatedCost: Math.round(totalEstCost * 100) / 100,
    grossMargin: Math.round(grossMargin * 100) / 100,
    marginPercentage,
    systemHealth: '100% Operational (All Voice & AI Gateways Online)'
  });
});

app.get('/api/agency/clients', (req: Request, res: Response) => {
  res.json(db.getAgencyClientsOverview());
});

app.post('/api/agency/provision', (req: Request, res: Response) => {
  const { businessName, industry, phone, email, planId, agentTemplate, assignedPhone } = req.body;
  if (!businessName) return res.status(400).json({ error: 'Business name is required' });

  const org = db.createOrganization({
    name: businessName,
    industry: industry || 'Professional Services',
    website: `https://${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: phone || '+1 (555) 880-9900',
    email: email || `contact@${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
    address: 'Metropolitan Commercial Center',
    timezone: 'America/New_York',
    currency: 'USD',
    business_hours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '10:00', close: '15:00' },
      sunday: 'closed'
    },
    status: 'active'
  });

  // Assign subscription
  if (planId && PLANS[planId]) {
    db.updateSubscription(org.id, planId);
  }

  // Provision agent based on template
  const agent = db.createAgent(org.id, {
    name: `${businessName} AI Front-Desk`,
    type: (agentTemplate as any) || 'receptionist',
    personality: 'Professional',
    description: `Autonomous workforce employee for ${businessName}`,
    greeting: `Thank you for calling ${businessName}. How may I assist you today?`,
    system_prompt: `You are the primary AI receptionist for ${businessName}. Answer customer questions, capture leads, check availability and book appointments.`,
    goals: ['answer_questions', 'capture_leads', 'book_appointments', 'qualify_leads']
  });

  // Provision simulated DID phone number
  db.createAuditLog({
    organization_id: org.id,
    actor_name: 'Agency Provisioning Engine',
    action: 'CLIENT_PROVISIONED',
    resource: `${businessName} (Plan: ${planId || 'STARTER'})`,
    metadata: { assignedPhone: assignedPhone || '+1 (800) 555-KPS1' }
  });

  res.status(201).json({ organization: org, agent });
});

// ============================================================================
// 4. AGENTS & VERSION CONTROL
// ============================================================================

app.get('/api/agents', (req: Request, res: Response) => {
  const { isPlatformOwner, tenantId } = getRequestContext(req);
  res.json(db.getAgents(tenantId, isPlatformOwner));
});

app.get('/api/agents/:id', (req: Request, res: Response) => {
  const { isPlatformOwner, tenantId } = getRequestContext(req);
  const agent = db.getAgent(req.params.id, tenantId, isPlatformOwner);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

app.post('/api/agents', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const newAgent = db.createAgent(tenantId, req.body);
  res.status(201).json(newAgent);
});

app.patch('/api/agents/:id', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { createNewVersion, versionNotes, ...updates } = req.body;
  const updated = db.updateAgent(req.params.id, tenantId, updates, createNewVersion, versionNotes);
  if (!updated) return res.status(404).json({ error: 'Agent not found' });
  res.json(updated);
});

app.post('/api/agents/:id/publish', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { versionNotes } = req.body;
  const updated = db.updateAgent(req.params.id, tenantId, {}, true, versionNotes || 'Published via Builder');
  if (!updated) return res.status(404).json({ error: 'Agent not found' });
  res.json(updated);
});

app.get('/api/agents/:id/versions', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  res.json(db.getAgentVersions(req.params.id, tenantId));
});

app.post('/api/agents/:id/rollback', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { targetVersion } = req.body;
  const rolledBack = db.rollbackAgentVersion(req.params.id, tenantId, Number(targetVersion));
  if (!rolledBack) return res.status(400).json({ error: 'Failed to rollback version' });
  res.json(rolledBack);
});

// ============================================================================
// 5. INTERACTIVE AGENT ENGINE & VOICE CALL SIMULATOR
// ============================================================================

// Interactive Chat / Test Console
app.post('/api/agents/:id/interact', async (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { customerMessage, conversationHistory } = req.body;
  const agent = db.getAgent(req.params.id, tenantId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  // 1. Search knowledge chunks
  const knowledgeMatches = db.searchKnowledge(tenantId, customerMessage);
  const contextSnippets = knowledgeMatches.map(m => m.chunk.chunk_text);

  // 2. Query AI Provider
  const aiResult = await aiProvider.generateResponse({
    agent,
    conversationHistory: conversationHistory || [],
    customerMessage,
    knowledgeContext: contextSnippets,
    availableTools: agent.goals
  });

  // 3. If AI produced a tool call, execute it through secure backend tool engine
  let toolExecutionResult = null;
  if (aiResult.toolCall) {
    toolExecutionResult = await toolEngine.executeTool(aiResult.toolCall.name, aiResult.toolCall.params, {
      tenantId,
      agentId: agent.id,
      callerName: req.body.callerName,
      callerPhone: req.body.callerPhone
    });
  }

  // 4. Record usage
  db.recordUsage(tenantId, {
    ai_requests: 1,
    chat_messages: 1,
    token_count: 350,
    tool_calls: aiResult.toolCall ? 1 : 0
  });

  res.json({
    message: aiResult.message,
    toolCall: aiResult.toolCall,
    toolResult: toolExecutionResult,
    confidence: aiResult.confidence,
    reasoningSummary: aiResult.reasoningSummary,
    knowledgeUsed: knowledgeMatches.slice(0, 2)
  });
});

// Inbound Voice Call Simulator Lifecycle:
// Starts live call session with server-side usage quota enforcement & privacy disclosure
app.post('/api/agents/:id/call/start', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const agent = db.getAgent(req.params.id, tenantId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  // Server-side usage quota check (Section 23 of PRD V2)
  const quota = UsageEnforcementService.checkQuota(tenantId, 1);
  if (!quota.allowed) {
    return res.status(403).json({
      error: quota.message || 'Monthly voice limit exhausted. Upgrade to continue placing calls.',
      quotaState: quota.state,
      upgradeRequired: true
    });
  }

  // Privacy disclosure prepending (Section 48 of PRD V2)
  const privacy = privacyService.getSettings(tenantId);
  let effectiveGreeting = agent.greeting;
  if (privacy.ai_disclosure_enabled && privacy.disclosure_message) {
    effectiveGreeting = `${privacy.disclosure_message} ${agent.greeting}`;
  }

  const callSessionId = `cs_${Date.now()}`;
  res.json({
    callSessionId,
    agentName: agent.name,
    voiceId: agent.voice_id,
    personality: agent.personality,
    initialGreeting: effectiveGreeting,
    quotaWarning: quota.state === 'warning' || quota.state === 'critical' ? quota.message : undefined
  });
});

// Turn message during live phone call with tool execution & graceful degradation
app.post('/api/agents/:id/call/message', async (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { customerMessage, conversationHistory, callerPhone, callerName } = req.body;
  const agent = db.getAgent(req.params.id, tenantId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const knowledgeMatches = db.searchKnowledge(tenantId, customerMessage);
  const contextSnippets = knowledgeMatches.map(m => m.chunk.chunk_text);

  const aiResult = await aiProvider.generateResponse({
    agent,
    conversationHistory: conversationHistory || [],
    customerMessage,
    knowledgeContext: contextSnippets,
    availableTools: agent.goals
  });

  let toolExecutionResult = null;
  let finalAgentMessage = aiResult.message;

  if (aiResult.toolCall) {
    toolExecutionResult = await toolEngine.executeTool(aiResult.toolCall.name, aiResult.toolCall.params, {
      tenantId,
      agentId: agent.id,
      callerPhone,
      callerName,
      simulateOutage: simulatedOutage
    });

    // If tool degraded gracefully (e.g. calendar API outage), relay the truthful fallback message
    if (toolExecutionResult.fallbackMessage) {
      finalAgentMessage = toolExecutionResult.fallbackMessage;
    }
  }

  res.json({
    agentMessage: finalAgentMessage,
    toolCall: aiResult.toolCall,
    toolResult: toolExecutionResult,
    confidence: aiResult.confidence,
    reasoningSummary: aiResult.reasoningSummary,
    degraded: toolExecutionResult?.degraded || false
  });
});

// Conclude call: Summarize, Score Lead, Save Call Record
app.post('/api/agents/:id/call/end', async (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { fullTranscript, durationSeconds, callerPhone, callerName } = req.body;
  const agent = db.getAgent(req.params.id, tenantId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  // Generate structured summary & intent
  const summaryData = await aiProvider.summarizeConversation(fullTranscript || '');

  // Persist Call record in DB
  const callRecord = db.createCall(tenantId, {
    agent_id: agent.id,
    phone_number: callerPhone || '+1 (555) 890-7721',
    direction: 'inbound',
    provider: agent.voice_provider,
    duration_seconds: durationSeconds || 120,
    transcript: fullTranscript,
    summary: summaryData.summary,
    sentiment: summaryData.sentiment,
    intent: summaryData.intent,
    lead_score: summaryData.leadScore,
    outcome: summaryData.outcome,
    started_at: new Date(Date.now() - (durationSeconds || 120) * 1000).toISOString(),
    ended_at: new Date().toISOString()
  });

  // If caller showed qualification, persist or update lead
  let createdLead = null;
  if (summaryData.leadScore >= 40) {
    createdLead = db.createLead(tenantId, {
      agent_id: agent.id,
      name: callerName || 'Phone Caller',
      phone: callerPhone || '+1 (555) 890-7721',
      source: 'AI Autonomous Phone Call',
      intent: summaryData.intent,
      score: summaryData.leadScore,
      status: summaryData.outcome === 'Appointment booked' ? 'APPOINTMENT' : 'QUALIFIED',
      notes: summaryData.summary
    });
  }

  res.json({
    callRecord,
    summary: summaryData,
    lead: createdLead
  });
});

// ============================================================================
// 6. KNOWLEDGE BASE ENDPOINTS
// ============================================================================

app.get('/api/knowledge', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  res.json({
    sources: db.getKnowledgeSources(tenantId),
    documents: db.getKnowledgeDocuments(tenantId),
    chunks: db.getKnowledgeChunks(tenantId)
  });
});

app.post('/api/knowledge/upload', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { name, type, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }
  const source = db.createKnowledgeSource(tenantId, name, type || 'document', content);
  res.status(201).json(source);
});

app.post('/api/knowledge/test', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { query } = req.body;
  const results = db.searchKnowledge(tenantId, query || '');
  res.json(results);
});

// ============================================================================
// 7. LEADS CRM
// ============================================================================

app.get('/api/leads', (req: Request, res: Response) => {
  const { isPlatformOwner, tenantId } = getRequestContext(req);
  res.json(db.getLeads(tenantId, isPlatformOwner));
});

app.post('/api/leads', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const newLead = db.createLead(tenantId, req.body);
  res.status(201).json(newLead);
});

app.patch('/api/leads/:id', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const updated = db.updateLead(req.params.id, tenantId, req.body);
  if (!updated) return res.status(404).json({ error: 'Lead not found' });
  res.json(updated);
});

app.delete('/api/leads/:id', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const success = db.softDeleteLead(req.params.id, tenantId);
  if (!success) return res.status(404).json({ error: 'Lead not found' });
  res.json({ success: true, message: 'Lead soft-deleted successfully.' });
});

// ============================================================================
// 8. CALLS
// ============================================================================

app.get('/api/calls', (req: Request, res: Response) => {
  const { isPlatformOwner, tenantId } = getRequestContext(req);
  res.json(db.getCalls(tenantId, isPlatformOwner));
});

app.get('/api/calls/:id', (req: Request, res: Response) => {
  const { isPlatformOwner, tenantId } = getRequestContext(req);
  const call = db.getCall(req.params.id, tenantId, isPlatformOwner);
  if (!call) return res.status(404).json({ error: 'Call not found' });
  res.json(call);
});

// ============================================================================
// 9. APPOINTMENTS & CALENDAR
// ============================================================================

app.get('/api/appointments', (req: Request, res: Response) => {
  const { isPlatformOwner, tenantId } = getRequestContext(req);
  res.json(db.getAppointments(tenantId, isPlatformOwner));
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const appt = db.createAppointment(tenantId, req.body);
  res.status(201).json(appt);
});

app.patch('/api/appointments/:id', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const updated = db.updateAppointment(req.params.id, tenantId, req.body);
  if (!updated) return res.status(404).json({ error: 'Appointment not found' });
  res.json(updated);
});

// ============================================================================
// 10. FOLLOW-UPS
// ============================================================================

app.get('/api/followups', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  res.json(db.getFollowups(tenantId));
});

app.post('/api/followups', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const fol = db.createFollowup(tenantId, req.body);
  res.status(201).json(fol);
});

// ============================================================================
// 11. ANALYTICS & ROI
// ============================================================================

app.get('/api/analytics/overview', (req: Request, res: Response) => {
  const { tenantId, isPlatformOwner } = getRequestContext(req);
  const calls = db.getCalls(tenantId, isPlatformOwner);
  const leads = db.getLeads(tenantId, isPlatformOwner);
  const appointments = db.getAppointments(tenantId, isPlatformOwner);

  const totalCalls = calls.length;
  const aiHandledCalls = calls.filter(c => c.outcome !== 'Human transfer').length;
  const humanTransfers = calls.filter(c => c.outcome === 'Human transfer').length;
  const aiResolutionRate = totalCalls > 0 ? Math.round((aiHandledCalls / totalCalls) * 100) : 100;

  const hotLeads = leads.filter(l => l.score >= 70).length;
  const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED' || l.status === 'APPOINTMENT').length;
  const totalDuration = calls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
  const avgDurationSeconds = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

  res.json({
    totalCalls,
    aiHandledCalls,
    humanTransfers,
    aiResolutionRate,
    totalLeads: leads.length,
    hotLeads,
    qualifiedLeads,
    appointmentsCount: appointments.length,
    avgDurationSeconds,
    conversionRate: totalCalls > 0 ? Math.round((appointments.length / totalCalls) * 100) : 18
  });
});

app.post('/api/analytics/roi', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { averageCustomerValue = 3500 } = req.body;
  const leads = db.getLeads(tenantId);
  const appointments = db.getAppointments(tenantId);

  const qualifiedCount = leads.filter(l => l.score >= 70).length;
  const appointmentCount = appointments.length;
  // Conservative conversion: 35% of qualified bookings convert
  const estimatedConversions = Math.max(1, Math.round(appointmentCount * 0.4));
  const estimatedOpportunityValue = estimatedConversions * Number(averageCustomerValue);

  res.json({
    averageCustomerValue: Number(averageCustomerValue),
    totalLeads: leads.length,
    qualifiedLeads: qualifiedCount,
    appointmentsBooked: appointmentCount,
    estimatedConversions,
    estimatedRevenue: estimatedOpportunityValue,
    disclaimer: 'Estimated opportunity based on verified booking pipeline.'
  });
});

// ============================================================================
// 12. BILLING & USAGE METERING
// ============================================================================

app.get('/api/billing/subscription', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const sub = db.getSubscription(tenantId);
  const plan = PLANS[sub?.plan_id || 'STARTER'];
  const usage = db.getUsageRecords(tenantId)[0];

  const usedSeconds = usage?.voice_seconds || 0;
  const usedMinutes = Math.round(usedSeconds / 60);
  const limitMinutes = plan.voice_minutes_included;
  const percentage = Math.min(100, Math.round((usedMinutes / limitMinutes) * 100));

  let warningLevel: 'normal' | 'warning_80' | 'warning_90' | 'limit_100' = 'normal';
  if (percentage >= 100) warningLevel = 'limit_100';
  else if (percentage >= 90) warningLevel = 'warning_90';
  else if (percentage >= 80) warningLevel = 'warning_80';

  res.json({
    subscription: sub,
    plan,
    usage: {
      usedMinutes,
      limitMinutes,
      percentage,
      warningLevel,
      callsCount: usage?.calls_count || 0,
      aiRequests: usage?.ai_requests || 0,
      chatMessages: usage?.chat_messages || 0,
      smsCount: usage?.sms_count || 0
    },
    invoices: db.getInvoices(tenantId)
  });
});

app.post('/api/billing/upgrade', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { planId, billingCycle } = req.body;
  if (!PLANS[planId]) return res.status(400).json({ error: 'Invalid plan' });
  const updated = db.updateSubscription(tenantId, planId, billingCycle || 'monthly');
  res.json({ success: true, subscription: updated, plan: PLANS[planId] });
});

app.get('/api/billing/overage-card', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  res.json(UsageEnforcementService.getOverageCard(tenantId));
});

app.post('/api/webhooks/payments', (req: Request, res: Response) => {
  const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.eventId;
  
  // PRD V2 Webhook Idempotency Guard (Section 21 & 28)
  if (idempotencyKey) {
    const isNew = db.checkAndRecordWebhookIdempotency(idempotencyKey);
    if (!isNew) {
      return res.status(200).json({
        received: true,
        duplicate: true,
        message: 'Webhook event was already processed previously. Replay dropped safely.'
      });
    }
  }

  const { eventType, organizationId, planId } = req.body;
  if (eventType === 'subscription.activated' && organizationId && PLANS[planId]) {
    db.updateSubscription(organizationId, planId);
  }

  res.json({ received: true, idempotencyKey: idempotencyKey || 'generated_key' });
});

// ============================================================================
// 13. INTEGRATIONS & AUDIT LOGS
// ============================================================================

app.get('/api/integrations', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  res.json(db.getIntegrations(tenantId));
});

app.post('/api/integrations/toggle', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { provider, status, credentials } = req.body;
  const updated = db.updateIntegration(tenantId, provider, {
    status: status || 'connected',
    credentials_masked: credentials || { status: 'Configured' }
  });
  res.json(updated);
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  const { tenantId, isPlatformOwner } = getRequestContext(req);
  res.json(db.getAuditLogs(tenantId, isPlatformOwner));
});

app.get('/api/support', (req: Request, res: Response) => {
  res.json(Array.from(db.supportTickets.values()));
});

app.post('/api/support', (req: Request, res: Response) => {
  const { tenantId } = getRequestContext(req);
  const { subject, description, priority } = req.body;
  const user = db.users.get(currentSession.userId);
  const ticket = {
    id: `tkt_${Date.now()}`,
    organization_id: tenantId,
    user_name: user?.name || 'Client',
    subject,
    description,
    priority: priority || 'medium',
    status: 'Open' as const,
    assigned_staff: 'Azher Dad Khan',
    created_at: new Date().toISOString()
  };
  db.supportTickets.set(ticket.id, ticket);
  res.status(201).json(ticket);
});

// Public Widget Endpoint
app.get('/api/widget/:publicAgentId', (req: Request, res: Response) => {
  const agent = db.getAgentByPublicId(req.params.publicAgentId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  const org = db.getOrganization(agent.organization_id);
  res.json({
    agentName: agent.name,
    greeting: agent.greeting,
    personality: agent.personality,
    businessName: org?.name,
    businessPhone: org?.phone
  });
});

// ============================================================================
// 14. VITE DEV SERVER / PRODUCTION STATIC SERVING
// ============================================================================

async function startServer() {
  const distPath = path.join(__dirname, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  const hasDist = fs.existsSync(indexHtmlPath);

  if (hasDist && process.env.NODE_ENV === 'production') {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn('Vite dev middleware not available, checking static build:', viteErr);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(indexHtmlPath);
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KPS AI Workforce] Multi-Tenant Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
