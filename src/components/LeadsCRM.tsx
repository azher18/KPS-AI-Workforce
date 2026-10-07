// ============================================================================
// KPS AI Workforce - Built-in Multi-Tenant Leads CRM
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Flame, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  Check, 
  Edit3,
  X
} from 'lucide-react';
import type { Lead, LeadStatus } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

export const LeadsCRM: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    intent: '',
    budget: '',
    requirements: '',
    score: 75,
    status: 'NEW' as LeadStatus
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson<Lead[]>('/api/leads');
      setLeads(data);
    } catch (e) {
      console.error('Failed to load leads:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await fetchJson<Lead>('/api/leads', {
        method: 'POST',
        body: JSON.stringify(newLeadForm)
      });
      setLeads([created, ...leads]);
      setIsCreatingLead(false);
      setNewLeadForm({
        name: '',
        phone: '',
        email: '',
        intent: '',
        budget: '',
        requirements: '',
        score: 75,
        status: 'NEW'
      });
    } catch (e) {
      console.error('Failed to create lead:', e);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const updated = await fetchJson<Lead>(`/api/leads/${leadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setLeads(leads.map(l => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) setSelectedLead(updated);
    } catch (e) {
      console.error('Failed to update lead:', e);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.intent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;

    let matchesScore = true;
    if (scoreFilter === 'hot') matchesScore = l.score >= 70;
    else if (scoreFilter === 'warm') matchesScore = l.score >= 40 && l.score < 70;
    else if (scoreFilter === 'cold') matchesScore = l.score < 40;

    return matchesSearch && matchesStatus && matchesScore;
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-amber-400';
    if (score >= 40) return 'text-blue-400';
    return 'text-slate-400';
  };

  const getScoreTier = (score: number) => {
    if (score >= 70) return 'Hot';
    if (score >= 40) return 'Warm';
    return 'Cold';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Leads CRM</h2>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>{leads.length} total captured prospects</span>
            <span>·</span>
            <span className="text-amber-400 font-medium">
              {leads.filter(l => l.score >= 70).length} Hot Leads (Priority)
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingLead(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone, intent..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            {['all', 'NEW', 'QUALIFIED', 'APPOINTMENT', 'CONVERTED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                  statusFilter === st ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Score Tier Segment */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            {(['all', 'hot', 'warm', 'cold'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setScoreFilter(tier)}
                className={`px-2 py-1 rounded capitalize transition font-medium ${
                  scoreFilter === tier ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier === 'all' ? 'All Scores' : tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4">Lead Name &amp; Contact</th>
                <th className="py-3 px-4">Intent &amp; Requirements</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Last Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading CRM leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm text-slate-300">No leads found</p>
                    <p className="text-xs text-slate-500 mt-1">Inbound calls and website conversations will appear here automatically.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{lead.phone || 'No phone'}</span>
                        {lead.email && (
                          <>
                            <span>·</span>
                            <span>{lead.email}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-200 truncate">{lead.intent}</div>
                      {lead.budget && (
                        <div className="text-[11px] text-slate-400 mt-0.5">Budget: {lead.budget}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`font-bold ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          · {getScoreTier(lead.score)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">
                        · {lead.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {lead.source}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(lead.last_contact).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="text-slate-400 hover:text-blue-400 text-xs font-medium px-2 py-1"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Slide-over / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedLead.name}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{selectedLead.source}</span>
                  <span>·</span>
                  <span className={getScoreColor(selectedLead.score)}>
                    Score: {selectedLead.score}/100 ({getScoreTier(selectedLead.score)})
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block mb-1">Phone Number</span>
                  <span className="text-slate-200 font-mono text-sm">{selectedLead.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Email Address</span>
                  <span className="text-slate-200 text-sm">{selectedLead.email || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Stated Intent</span>
                <p className="text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {selectedLead.intent}
                </p>
              </div>

              {selectedLead.requirements && (
                <div>
                  <span className="text-slate-500 block mb-1">Requirements &amp; Location</span>
                  <p className="text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {selectedLead.requirements}
                  </p>
                </div>
              )}

              {selectedLead.notes && (
                <div>
                  <span className="text-slate-500 block mb-1">Autonomous AI Agent Notes</span>
                  <p className="text-slate-300 bg-blue-950/20 border border-blue-900/40 p-3 rounded-lg leading-relaxed">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-500 block mb-1.5">Lifecycle Status</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT', 'NEGOTIATION', 'CONVERTED', 'LOST'] as LeadStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`px-2.5 py-1 rounded text-xs transition ${
                        selectedLead.status === st
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {isCreatingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateLead} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-4">
            <button
              type="button"
              onClick={() => setIsCreatingLead(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">Create New Lead</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Prospect Name</label>
              <input
                type="text"
                required
                value={newLeadForm.name}
                onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="Harrison Sterling"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={newLeadForm.phone}
                  onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="+1 (212) 555-8912"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newLeadForm.email}
                  onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="client@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Intent</label>
              <input
                type="text"
                required
                value={newLeadForm.intent}
                onChange={e => setNewLeadForm({ ...newLeadForm, intent: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="Inquiring about 740 Park Ave Penthouse"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Budget</label>
                <input
                  type="text"
                  value={newLeadForm.budget}
                  onChange={e => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="$5,000,000+"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newLeadForm.score}
                  onChange={e => setNewLeadForm({ ...newLeadForm, score: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingLead(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Save Lead
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
