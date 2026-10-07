// ============================================================================
// KPS AI Workforce - Master Application Root Component
// Khans Professional Services
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { MarketingPage } from './components/MarketingPage.js';
import { DashboardOverview } from './components/DashboardOverview.js';
import { AgentBuilder } from './components/AgentBuilder.js';
import { CallsList } from './components/CallsList.js';
import { LeadsCRM } from './components/LeadsCRM.js';
import { AppointmentsManager } from './components/AppointmentsManager.js';
import { KnowledgeManager } from './components/KnowledgeManager.js';
import { FollowupsManager } from './components/FollowupsManager.js';
import { AnalyticsROI } from './components/AnalyticsROI.js';
import { BillingUsage } from './components/BillingUsage.js';
import { AgencyAdmin } from './components/AgencyAdmin.js';
import { OnboardingWizard } from './components/OnboardingWizard.js';
import { IntegrationsManager } from './components/IntegrationsManager.js';
import { CallSimulatorModal } from './components/CallSimulatorModal.js';
import { WidgetEmbedModal } from './components/WidgetEmbedModal.js';
import { PrivacySettingsManager } from './components/PrivacySettingsManager.js';
import { SystemHealthDashboard } from './components/SystemHealthDashboard.js';
import { DatabaseArchitectureView } from './components/DatabaseArchitectureView.js';
import { AuthRecoveryModal } from './components/AuthRecoveryModal.js';
import type { User, Organization, Agent, Call } from './types/index.ts';
import { fetchJson } from './lib/api.js';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [accessibleOrgs, setAccessibleOrgs] = useState<Organization[]>([]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Modals
  const [isCallSimulatorOpen, setIsCallSimulatorOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isWidgetEmbedOpen, setIsWidgetEmbedOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSessionExpiredPrompt, setIsSessionExpiredPrompt] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    setIsLoadingSession(true);
    try {
      const data = await fetchJson('/api/session');
      setCurrentUser(data.user);
      setActiveOrg(data.activeOrganization);
      setAccessibleOrgs(data.accessibleOrganizations || []);
      setIsImpersonating(data.isImpersonating || false);

      if (data.activeOrganization?.id) {
        localStorage.setItem('kps_active_tenant_id', data.activeOrganization.id);
        const agList = await fetchJson<Agent[]>('/api/agents');
        setAgents(agList);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSwitchTenant = async (orgId: string) => {
    try {
      localStorage.setItem('kps_active_tenant_id', orgId);
      const res = await fetchJson('/api/auth/switch-tenant', {
        method: 'POST',
        body: JSON.stringify({ tenantId: orgId })
      });
      setActiveOrg(res.activeOrganization);
      const agList = await fetchJson<Agent[]>('/api/agents');
      setAgents(agList);
    } catch (e) {
      console.error('Failed to switch tenant:', e);
    }
  };

  const handleImpersonateOrg = async (orgId: string) => {
    try {
      localStorage.setItem('kps_active_tenant_id', orgId);
      const res = await fetchJson('/api/auth/impersonate', {
        method: 'POST',
        body: JSON.stringify({ tenantId: orgId })
      });
      setActiveOrg(res.activeOrganization);
      setIsImpersonating(true);
      setIsAdminMode(false);
      setCurrentView('dashboard');
      const agList = await fetchJson<Agent[]>('/api/agents');
      setAgents(agList);
    } catch (e) {
      console.error('Failed to impersonate org:', e);
    }
  };

  const handleStopImpersonating = async () => {
    try {
      const res = await fetchJson('/api/auth/stop-impersonate', { method: 'POST' });
      setActiveOrg(res.activeOrganization);
      setIsImpersonating(false);
      setIsAdminMode(true);
      setCurrentView('agency-overview');
    } catch (e) {
      console.error('Failed to stop impersonating:', e);
    }
  };

  const handleOnboardingCompleted = async (newOrg: any) => {
    setIsOnboardingOpen(false);
    await loadSession();
    setCurrentView('dashboard');
  };

  const handleCallCompleted = (call: Call) => {
    // Refresh active agents/calls
  };

  const activeAgent = agents[0] || {
    id: 'agt_apex_sarah',
    name: 'Sarah - AI Front-Desk Receptionist',
    type: 'receptionist',
    voice_provider: 'retell',
    voice_id: 'voice_alloy',
    personality: 'Luxury',
    greeting: 'Hello, thank you for calling. How may I assist you today?',
    public_id: 'pub_apex_sarah_99'
  } as Agent;

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400 text-xs">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>Initializing KPS AI Workforce Enterprise Platform...</div>
        </div>
      </div>
    );
  }

  // If viewing Marketing Website
  if (currentView === 'marketing') {
    return (
      <>
        <MarketingPage
          onBuildAgent={() => {
            setIsOnboardingOpen(true);
          }}
          onTalkToAgent={() => {
            setIsCallSimulatorOpen(true);
          }}
          onOpenDashboard={() => {
            setCurrentView('dashboard');
          }}
        />

        <CallSimulatorModal
          isOpen={isCallSimulatorOpen}
          onClose={() => setIsCallSimulatorOpen(false)}
          agent={activeAgent}
          onCallCompleted={handleCallCompleted}
        />

        {isOnboardingOpen && (
          <OnboardingWizard
            onCompleted={handleOnboardingCompleted}
            onCancel={() => setIsOnboardingOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        role={currentUser?.role || 'organization_owner'}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => {
          setIsAdminMode(!isAdminMode);
          setCurrentView(!isAdminMode ? 'agency-overview' : 'dashboard');
        }}
        onSimulateCall={() => setIsCallSimulatorOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentUser={currentUser}
          activeOrg={activeOrg}
          accessibleOrgs={accessibleOrgs}
          onSwitchTenant={handleSwitchTenant}
          isImpersonating={isImpersonating}
          onStopImpersonating={handleStopImpersonating}
          onOpenMarketing={() => setCurrentView('marketing')}
          onStartOnboarding={() => setIsOnboardingOpen(true)}
          onOpenAuth={() => {
            setIsSessionExpiredPrompt(false);
            setIsAuthModalOpen(true);
          }}
          onSimulateSessionExpire={() => {
            setIsSessionExpiredPrompt(true);
            setIsAuthModalOpen(true);
          }}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Business Views */}
          {currentView === 'dashboard' && (
            <DashboardOverview
              onSimulateCall={() => setIsCallSimulatorOpen(true)}
              onNavigate={view => setCurrentView(view)}
              onOpenWidgetEmbed={() => setIsWidgetEmbedOpen(true)}
            />
          )}

          {currentView === 'agents' && (
            <AgentBuilder
              agentId={activeAgent.id}
              onAgentUpdated={loadSession}
            />
          )}

          {currentView === 'calls' && (
            <CallsList onSimulateCall={() => setIsCallSimulatorOpen(true)} />
          )}

          {currentView === 'leads' && <LeadsCRM />}

          {currentView === 'appointments' && <AppointmentsManager />}

          {currentView === 'followups' && <FollowupsManager />}

          {currentView === 'knowledge' && <KnowledgeManager />}

          {currentView === 'integrations' && <IntegrationsManager />}

          {currentView === 'privacy' && <PrivacySettingsManager />}

          {currentView === 'health' && <SystemHealthDashboard />}

          {currentView === 'schema' && <DatabaseArchitectureView />}

          {currentView === 'analytics' && <AnalyticsROI />}

          {currentView === 'billing' && <BillingUsage />}

          {/* Agency HQ Views */}
          {(currentView === 'agency-overview' || currentView === 'agency-clients' || currentView === 'audit') && (
            <AgencyAdmin onImpersonateOrg={handleImpersonateOrg} />
          )}
        </main>
      </div>

      {/* Live Phone Call Simulator Modal */}
      <CallSimulatorModal
        isOpen={isCallSimulatorOpen}
        onClose={() => setIsCallSimulatorOpen(false)}
        agent={activeAgent}
        onCallCompleted={handleCallCompleted}
      />

      {/* Onboarding 10-Step Wizard Modal */}
      {isOnboardingOpen && (
        <OnboardingWizard
          onCompleted={handleOnboardingCompleted}
          onCancel={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* Embeddable Website Widget Modal */}
      <WidgetEmbedModal
        isOpen={isWidgetEmbedOpen}
        onClose={() => setIsWidgetEmbedOpen(false)}
        agent={activeAgent}
      />

      {/* Production Authentication & Session Expiry Recovery Modal */}
      <AuthRecoveryModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setIsSessionExpiredPrompt(false);
        }}
        isSessionExpiredPrompt={isSessionExpiredPrompt}
        onSessionUpdated={async (user) => {
          setIsAuthModalOpen(false);
          setIsSessionExpiredPrompt(false);
          await loadSession();
        }}
      />
    </div>
  );
}

export default App;
