// ============================================================================
// KPS AI Workforce - Event-Driven Follow-Up Automation Engine
// Section 24 of Specification: Configurable delay, channels, working windows.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Clock, 
  MessageSquare, 
  Mail, 
  Plus, 
  CheckCircle2, 
  ShieldCheck,
  X 
} from 'lucide-react';
import type { Followup } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

export const FollowupsManager: React.FC = () => {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [form, setForm] = useState({
    trigger_event: 'hot_lead_qualified',
    delay_hours: 2,
    channel: 'sms' as Followup['channel'],
    message_template: 'Hi {name}, this is Sarah from Apex Luxury Real Estate. Following up on our conversation regarding Penthouse A. Would tomorrow at 2 PM still work for your walkthrough?'
  });

  useEffect(() => {
    loadFollowups();
  }, []);

  const loadFollowups = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson<Followup[]>('/api/followups');
      setFollowups(data);
    } catch (e) {
      console.error('Failed to load followups:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await fetchJson<Followup>('/api/followups', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setFollowups([created, ...followups]);
      setIsNewOpen(false);
    } catch (e) {
      console.error('Failed to create followup:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Event-Driven Follow-Up Sequences</h2>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>{followups.length} automated triggers configured</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">Compliance &amp; Working Hours Window Enforced</span>
          </div>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Follow-Up Rule</span>
        </button>
      </div>

      {/* Compliance Note */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-white">Automated Opt-Out &amp; Quiet Hours Guard</h4>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            Follow-up messages are automatically queued only during configured business working hours (9 AM – 7 PM). Any caller replying "STOP" or expressing disinterest is immediately placed on the suppression list.
          </p>
        </div>
      </div>

      {/* Follow-up Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4">Prospect &amp; Trigger</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Message Template</th>
                <th className="py-3 px-4">Scheduled Window</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Loading follow-up queues...
                  </td>
                </tr>
              ) : followups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No follow-ups currently scheduled.
                  </td>
                </tr>
              ) : (
                followups.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.lead_name || 'Prospect'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{item.trigger_event}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="uppercase font-mono text-blue-400 font-medium">
                        · {item.channel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-md text-slate-300 truncate">
                      "{item.message_template}"
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(item.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-medium ${item.status === 'sent' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        · {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Follow-up Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-4">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">Create Automated Follow-Up Trigger</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Trigger Event</label>
              <select
                value={form.trigger_event}
                onChange={e => setForm({ ...form, trigger_event: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="hot_lead_qualified">Hot Lead Qualified (Score &gt;= 70)</option>
                <option value="appointment_confirmed">Appointment Booked Confirmation</option>
                <option value="human_transfer_requested">Human Transfer Follow-up</option>
                <option value="unanswered_inquiry">Unanswered FAQ Consultation</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Channel</label>
                <select
                  value={form.channel}
                  onChange={e => setForm({ ...form, channel: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="sms">SMS Text</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Execution Delay</label>
                <select
                  value={form.delay_hours}
                  onChange={e => setForm({ ...form, delay_hours: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>1 hour after call</option>
                  <option value={2}>2 hours after call</option>
                  <option value={24}>24 hours after call</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Message Template</label>
              <textarea
                rows={4}
                required
                value={form.message_template}
                onChange={e => setForm({ ...form, message_template: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Save Trigger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
