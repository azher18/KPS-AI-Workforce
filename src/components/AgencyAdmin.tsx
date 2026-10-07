// ============================================================================
// KPS AI Workforce - Agency Admin & Client Management Portal
// Khans Professional Services HQ
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  UserPlus, 
  Eye, 
  ExternalLink, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  FileText, 
  Lock,
  X
} from 'lucide-react';
import type { ClientHealthOverview, AuditLog, SupportTicket } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

interface AgencyAdminProps {
  onImpersonateOrg: (orgId: string) => void;
}

export const AgencyAdmin: React.FC<AgencyAdminProps> = ({ onImpersonateOrg }) => {
  const [overview, setOverview] = useState<any>(null);
  const [clients, setClients] = useState<ClientHealthOverview[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Provisioning Modal
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    businessName: '',
    industry: 'Real Estate',
    phone: '+1 (555) 780-1200',
    email: 'client@company.com',
    planId: 'GROWTH',
    agentTemplate: 'receptionist',
    assignedPhone: '+1 (800) 555-KPS2'
  });
  const [isProvisioning, setIsProvisioning] = useState(false);

  useEffect(() => {
    loadAgencyData();
  }, []);

  const loadAgencyData = async () => {
    setIsLoading(true);
    try {
      const [ovData, clData, audData, supData] = await Promise.all([
        fetchJson('/api/agency/overview'),
        fetchJson<ClientHealthOverview[]>('/api/agency/clients'),
        fetchJson<AuditLog[]>('/api/audit-logs'),
        fetchJson<SupportTicket[]>('/api/support')
      ]);
      setOverview(ovData);
      setClients(clData);
      setAuditLogs(audData);
      setSupportTickets(supData);
    } catch (e) {
      console.error('Failed to load agency data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvisionClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    try {
      await fetchJson('/api/agency/provision', {
        method: 'POST',
        body: JSON.stringify(provisionForm)
      });
      setIsProvisionOpen(false);
      await loadAgencyData();
    } catch (e) {
      console.error('Provisioning failed:', e);
    } finally {
      setIsProvisioning(false);
    }
  };

  if (isLoading || !overview) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading agency platform command center...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Agency Command Center</h2>
            <span className="text-xs text-blue-400 font-mono">Khans Professional Services HQ</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-tenant organizations, monitor provider margins, and provision new client AI workforces.
          </p>
        </div>

        <button
          onClick={() => setIsProvisionOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision New Client</span>
        </button>
      </div>

      {/* Platform Executive Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Monthly Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            ${overview.mrr.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            ARR Run-Rate: <strong className="text-slate-200 font-mono">${overview.arr.toLocaleString()}</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Provider Costs &amp; Margin</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {overview.marginPercentage}% Gross Margin
          </div>
          <div className="text-[11px] text-slate-400">
            Est. Costs: ${overview.estimatedCost} · Net: ${overview.grossMargin}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Client Businesses</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview.totalOrganizations} Clients
          </div>
          <div className="text-[11px] text-slate-400">
            {overview.activeAgents} autonomous AI employees deployed
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Voice Minutes Today</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview.voiceMinutes} mins
          </div>
          <div className="text-[11px] text-emerald-400">
            {overview.systemHealth}
          </div>
        </div>
      </div>

      {/* Client Businesses Management Table with Health Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-2 p-5">
        <h3 className="text-sm font-bold text-white mb-2">Client Portfolio &amp; Health Scores</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Business Name &amp; Industry</th>
                <th className="py-2.5 px-3">Plan &amp; MRR</th>
                <th className="py-2.5 px-3">Health Status</th>
                <th className="py-2.5 px-3">Agents</th>
                <th className="py-2.5 px-3">Voice Usage</th>
                <th className="py-2.5 px-3">Last Activity</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {clients.map(client => (
                <tr key={client.organization.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{client.organization.name}</div>
                    <div className="text-[11px] text-slate-400">{client.organization.industry}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-200">{client.plan.name}</span>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">${client.monthly_revenue}/mo</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        client.health === 'green' ? 'bg-emerald-500' :
                        client.health === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className={`font-medium ${
                        client.health === 'green' ? 'text-emerald-400' :
                        client.health === 'yellow' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {client.health.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{client.health_reason}</div>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-300">
                    {client.agent_count} Active
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono text-slate-200">{client.usage_minutes} min</div>
                    <div className="text-[11px] text-slate-500">Cap: {client.plan.voice_minutes_included} min</div>
                  </td>

                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {client.last_activity}
                  </td>

                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => onImpersonateOrg(client.organization.id)}
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs transition"
                    >
                      Impersonate Client
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Tickets & Platform Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Tickets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>Agency Client Support Tickets</span>
            </h4>
          </div>

          <div className="space-y-2.5 text-xs">
            {supportTickets.map(ticket => (
              <div key={ticket.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{ticket.subject}</span>
                  <span className={`text-[11px] font-medium ${
                    ticket.priority === 'urgent' || ticket.priority === 'high' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    · Priority: {ticket.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{ticket.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Client: {ticket.user_name}</span>
                  <span className="text-slate-300">Status: {ticket.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Audit Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Platform-wide Audit Trail</span>
          </h4>

          <div className="space-y-2 max-h-72 overflow-y-auto text-xs font-mono">
            {auditLogs.slice(0, 8).map(log => (
              <div key={log.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg flex items-start justify-between">
                <div>
                  <div className="text-blue-400 font-semibold">{log.action}</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">{log.resource}</div>
                  <div className="text-[11px] text-slate-500">By {log.actor_name}</div>
                </div>
                <div className="text-[11px] text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 1-Click Client Provisioning Wizard Modal */}
      {isProvisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleProvisionClient} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-4">
            <button
              type="button"
              onClick={() => setIsProvisionOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">Client Provisioning Wizard</h3>
            <p className="text-xs text-slate-400">
              The engine will automatically provision the client organization, deploy their initial autonomous AI employee, configure phone routing, and establish their subscription.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Business Name</label>
              <input
                type="text"
                required
                value={provisionForm.businessName}
                onChange={e => setProvisionForm({ ...provisionForm, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Prestige Automotive Gallery"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Industry</label>
                <select
                  value={provisionForm.industry}
                  onChange={e => setProvisionForm({ ...provisionForm, industry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Real Estate">Real Estate</option>
                  <option value="Clinics & Dental">Clinics &amp; Dental</option>
                  <option value="Salons & Spas">Salons &amp; Spas</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Home Services">Home Services</option>
                  <option value="Hotels">Hotels &amp; Hospitality</option>
                  <option value="Coaching">Coaching &amp; Education</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Plan</label>
                <select
                  value={provisionForm.planId}
                  onChange={e => setProvisionForm({ ...provisionForm, planId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="STARTER">Starter ($129/mo)</option>
                  <option value="GROWTH">Growth ($249/mo)</option>
                  <option value="AGENCY">Agency ($499/mo)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={provisionForm.email}
                  onChange={e => setProvisionForm({ ...provisionForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Direct Telephony DID</label>
                <input
                  type="text"
                  value={provisionForm.assignedPhone}
                  onChange={e => setProvisionForm({ ...provisionForm, assignedPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsProvisionOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProvisioning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
              >
                {isProvisioning ? 'Deploying Architecture...' : '1-Click Deploy Client'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
