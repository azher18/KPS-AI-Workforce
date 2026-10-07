// ============================================================================
// KPS AI Workforce - Business Owner Dashboard Overview
// Section 67: Answers "What happened? Why does it matter? What should I do next?"
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Phone, 
  PhoneCall, 
  Users, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Plus, 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  Code2, 
  Clock 
} from 'lucide-react';
import type { Agent, Call, Lead, Appointment } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

interface DashboardOverviewProps {
  onSimulateCall: () => void;
  onNavigate: (view: string) => void;
  onOpenWidgetEmbed: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSimulateCall,
  onNavigate,
  onOpenWidgetEmbed
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [agList, callList, leadList, apptList, anData] = await Promise.all([
        fetchJson<Agent[]>('/api/agents'),
        fetchJson<Call[]>('/api/calls'),
        fetchJson<Lead[]>('/api/leads'),
        fetchJson<Appointment[]>('/api/appointments'),
        fetchJson('/api/analytics/overview')
      ]);
      setAgents(agList);
      setCalls(callList);
      setLeads(leadList);
      setAppointments(apptList);
      setAnalytics(anData);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeAgent = agents[0];
  const hotLeads = leads.filter(l => l.score >= 70);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading operations dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action-Oriented Operations Banner (Section 67) */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-base font-bold text-white">Autonomous Workforce Active</h2>
            <span className="text-xs text-blue-400 font-mono">
              · {analytics?.totalCalls || 0} calls answered ({analytics?.aiResolutionRate || 95}% resolved by AI)
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {leads.length} total captured leads — <strong className="text-amber-400">{hotLeads.length} are hot</strong> with verified intent.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onSimulateCall}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Simulate Inbound Call</span>
          </button>

          <button
            onClick={() => onNavigate('leads')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1"
          >
            <span>View Hot Leads ({hotLeads.length})</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Calls Handled</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analytics?.totalCalls || 0}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {analytics?.aiResolutionRate || 100}% AI Resolution Rate
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Leads</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {leads.length}
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            {hotLeads.length} Hot Prospects Scored &gt; 70
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Calendar Bookings</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {appointments.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Google Calendar 2-Way Synced
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Human Handoffs</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analytics?.humanTransfers || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            VIP broker transfers with briefing notes
          </div>
        </div>
      </div>

      {/* Main Operations Split: Active Employee Fleet & Recent Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Calls Feed */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-400" />
              <span>Recent Autonomous Phone Calls</span>
            </h3>
            <button
              onClick={() => onNavigate('calls')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View All Calls</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {calls.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">
                No calls yet. Click "Simulate Inbound Call" above to test.
              </div>
            ) : (
              calls.slice(0, 4).map(call => (
                <div key={call.id} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{call.phone_number}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{call.intent}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-amber-400 font-bold">{call.lead_score}/100</span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(call.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    {call.summary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Outcome: <strong className="text-emerald-400 font-medium">{call.outcome}</strong></span>
                    <span>Duration: {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Active Agent Status & Quick Actions */}
        <div className="space-y-4">
          {/* Active AI Employee Status Box */}
          {activeAgent && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Armed AI Employee
                </span>
                <span className="text-xs text-emerald-400 font-mono font-medium">· ONLINE</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                  {activeAgent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeAgent.name}</h4>
                  <div className="text-xs text-slate-400">
                    Role: {activeAgent.type.toUpperCase()} · v{activeAgent.current_version}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Voice Provider:</span>
                  <span className="text-slate-300 font-medium">{activeAgent.voice_provider.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tone Preset:</span>
                  <span className="text-slate-300 font-medium">{activeAgent.personality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Google Calendar:</span>
                  <span className="text-emerald-400 font-medium">Connected</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onNavigate('agents')}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                >
                  Configure Agent
                </button>
                <button
                  onClick={onOpenWidgetEmbed}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                  title="Get Website Embed Widget"
                >
                  <Code2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Booked Calendar Appointments */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Upcoming Bookings</span>
              </h4>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {appointments.length === 0 ? (
                <div className="text-slate-500 text-xs py-2">No bookings currently scheduled.</div>
              ) : (
                appointments.slice(0, 3).map(appt => (
                  <div key={appt.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{appt.customer_name}</span>
                      <span className="text-blue-400 font-mono text-[11px]">{appt.appointment_time}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">{appt.service_name}</div>
                    <div className="text-[11px] text-slate-500">{appt.appointment_date}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
