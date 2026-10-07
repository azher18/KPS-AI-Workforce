// ============================================================================
// KPS AI Workforce - Visual AI Agent Builder & Version Management
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Mic, 
  Sliders, 
  ShieldAlert, 
  BookOpen, 
  Wrench, 
  History, 
  Save, 
  Send, 
  CheckCircle2, 
  RotateCcw,
  Plus
} from 'lucide-react';
import type { Agent, AgentVersion, Personality } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

interface AgentBuilderProps {
  agentId: string;
  onAgentUpdated?: () => void;
}

export const AgentBuilder: React.FC<AgentBuilderProps> = ({ agentId, onAgentUpdated }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'voice' | 'personality' | 'goals' | 'rules' | 'escalation' | 'tools' | 'versions' | 'test'>('identity');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  
  // Test Console State
  const [testMessages, setTestMessages] = useState<{ speaker: 'agent' | 'user'; text: string; toolCall?: any }[]>([]);
  const [testInput, setTestInput] = useState('');
  const [isTestResponding, setIsTestResponding] = useState(false);

  useEffect(() => {
    loadAgentData();
  }, [agentId]);

  const loadAgentData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson<Agent>(`/api/agents/${agentId}`);
      setAgent(data);
      const verList = await fetchJson<AgentVersion[]>(`/api/agents/${agentId}/versions`);
      setVersions(verList);
      setTestMessages([
        { speaker: 'agent', text: data.greeting }
      ]);
    } catch (e) {
      console.error('Failed to load agent:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!agent) return;
    setIsSaving(true);
    try {
      await fetchJson(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        body: JSON.stringify(agent)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onAgentUpdated) onAgentUpdated();
    } catch (e) {
      console.error('Failed to save draft:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishVersion = async () => {
    if (!agent) return;
    setIsSaving(true);
    try {
      const updated = await fetchJson(`/api/agents/${agent.id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ versionNotes: versionNotes || `Version ${agent.current_version + 1} deployment` })
      });
      setAgent(updated);
      setVersionNotes('');
      await loadAgentData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onAgentUpdated) onAgentUpdated();
    } catch (e) {
      console.error('Failed to publish version:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = async (verNum: number) => {
    if (!agent) return;
    if (!confirm(`Are you sure you want to rollback to Version ${verNum}?`)) return;
    setIsSaving(true);
    try {
      const rolled = await fetchJson(`/api/agents/${agent.id}/rollback`, {
        method: 'POST',
        body: JSON.stringify({ targetVersion: verNum })
      });
      setAgent(rolled);
      await loadAgentData();
      if (onAgentUpdated) onAgentUpdated();
    } catch (e) {
      console.error('Failed to rollback:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!testInput.trim() || isTestResponding || !agent) return;
    const msg = testInput;
    setTestInput('');
    setTestMessages(prev => [...prev, { speaker: 'user', text: msg }]);
    setIsTestResponding(true);

    try {
      const history = testMessages.map(m => ({ speaker: m.speaker, message: m.text }));
      const res = await fetchJson(`/api/agents/${agent.id}/interact`, {
        method: 'POST',
        body: JSON.stringify({ customerMessage: msg, conversationHistory: history })
      });

      setTestMessages(prev => [
        ...prev,
        {
          speaker: 'agent',
          text: res.message,
          toolCall: res.toolCall
        }
      ]);
    } catch (e) {
      console.error('Test conversation failed:', e);
    } finally {
      setIsTestResponding(false);
    }
  };

  if (isLoading || !agent) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading AI employee configuration...
      </div>
    );
  }

  const personalityPresets: Personality[] = ['Professional', 'Friendly', 'Luxury', 'Casual', 'Energetic', 'Consultative'];

  const goalsList = [
    { id: 'answer_questions', label: 'Answer Inquiries & FAQs', desc: 'Consult verified knowledge docs and policies' },
    { id: 'capture_leads', label: 'Capture Contact Details', desc: 'Request prospect name, phone, and email' },
    { id: 'qualify_leads', label: 'Qualify Intent & Budget', desc: 'Collect buyer requirements, timeline, and urgency' },
    { id: 'book_appointments', label: 'Live Calendar Booking', desc: 'Sync with Google Calendar to reserve showing slots' },
    { id: 'schedule_followups', label: 'Schedule Follow-Ups', desc: 'Trigger automated post-call SMS and email sequences' },
    { id: 'transfer_to_human', label: 'Transfer to Staff', desc: 'Handoff high-value clients with internal briefings' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Agent Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{agent.name}</h2>
              <span className="text-xs text-blue-400 font-mono">v{agent.current_version} · Active</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Type: {agent.type.toUpperCase()} · Personality: {agent.personality} · Voice: {agent.voice_provider.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </span>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={handlePublishVersion}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish v{agent.current_version + 1}</span>
          </button>
        </div>
      </div>

      {/* Builder Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 pb-2">
        {[
          { id: 'identity', label: 'Identity', icon: Bot },
          { id: 'voice', label: 'Voice & Speech', icon: Mic },
          { id: 'personality', label: 'Personality', icon: Sliders },
          { id: 'goals', label: 'Goals & Logic', icon: Sparkles },
          { id: 'rules', label: 'Business Rules', icon: BookOpen },
          { id: 'escalation', label: 'Escalation', icon: ShieldAlert },
          { id: 'tools', label: 'Authorized Tools', icon: Wrench },
          { id: 'versions', label: `Versions (${versions.length})`, icon: History },
          { id: 'test', label: 'Interactive Sandbox', icon: Send }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {/* 1. Identity Tab */}
        {activeTab === 'identity' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Agent Name</label>
              <input
                type="text"
                value={agent.name}
                onChange={e => setAgent({ ...agent, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Agent Role Type</label>
              <select
                value={agent.type}
                onChange={e => setAgent({ ...agent, type: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="receptionist">AI Front-Desk Receptionist</option>
                <option value="sales">AI Sales Specialist</option>
                <option value="qualification">Lead Qualification Agent</option>
                <option value="appointment">Appointment Coordinator</option>
                <option value="support">Customer Support Agent</option>
                <option value="followup">Lead Follow-Up Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Public Description</label>
              <textarea
                rows={2}
                value={agent.description}
                onChange={e => setAgent({ ...agent, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Inbound Phone Call Greeting</label>
              <textarea
                rows={3}
                value={agent.greeting}
                onChange={e => setAgent({ ...agent, greeting: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="The very first phrase spoken when answering the customer..."
              />
            </div>
          </div>
        )}

        {/* 2. Voice Tab */}
        {activeTab === 'voice' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Voice Telephony Engine</label>
              <select
                value={agent.voice_provider}
                onChange={e => setAgent({ ...agent, voice_provider: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="retell">Retell AI (Sub-800ms Latency)</option>
                <option value="vapi">Vapi Voice Engine</option>
                <option value="elevenlabs">ElevenLabs Conversational TTS</option>
                <option value="simulator">WebRTC Telephony Simulator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Voice Profile Model</label>
              <select
                value={agent.voice_id}
                onChange={e => setAgent({ ...agent, voice_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="voice_alloy">Alloy (Authoritative, Polished Executive)</option>
                <option value="voice_nova">Nova (Warm, Cheerful, Empathetic Coordinator)</option>
                <option value="voice_shimmer">Shimmer (Prestigious, Luxury Concierge)</option>
                <option value="voice_echo">Echo (Consultative, Analytical Specialist)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Spoken Language</label>
              <select
                value={agent.language}
                onChange={e => setAgent({ ...agent, language: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
                <option value="en-IN">English (India)</option>
                <option value="es-ES">Spanish</option>
              </select>
            </div>
          </div>
        )}

        {/* 3. Personality Tab */}
        {activeTab === 'personality' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Preset Persona Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {personalityPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAgent({ ...agent, personality: preset })}
                    className={`p-3 rounded-xl border text-left transition ${
                      agent.personality === preset
                        ? 'border-blue-500 bg-blue-600/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">{preset}</div>
                    <div className="text-[11px] text-slate-500">
                      {preset === 'Luxury' && 'Refined, discreet, high-ticket concierge'}
                      {preset === 'Professional' && 'Direct, articulate, corporate standard'}
                      {preset === 'Friendly' && 'Warm, inviting, service-oriented'}
                      {preset === 'Consultative' && 'Inquisitive, analytical advisor'}
                      {preset === 'Energetic' && 'High enthusiasm, fast-paced closer'}
                      {preset === 'Casual' && 'Relaxed, modern conversational tone'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Core Autonomous Directive (System Prompt)</label>
              <textarea
                rows={6}
                value={agent.system_prompt}
                onChange={e => setAgent({ ...agent, system_prompt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* 4. Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4 max-w-2xl">
            <label className="block text-xs font-medium text-slate-300 mb-1">Authorized Capabilities</label>
            <div className="space-y-2.5">
              {goalsList.map(goal => {
                const isChecked = agent.goals.includes(goal.id);
                return (
                  <label
                    key={goal.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? 'bg-blue-600/10 border-blue-500/40'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const newGoals = isChecked
                          ? agent.goals.filter(g => g !== goal.id)
                          : [...agent.goals, goal.id];
                        setAgent({ ...agent, goals: newGoals });
                      }}
                      className="mt-1 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-200">{goal.label}</div>
                      <div className="text-xs text-slate-400">{goal.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Strict Business Rules &amp; Anti-Hallucination Boundaries
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Mandatory rules the AI will never break under any circumstance.
              </p>
              <textarea
                rows={8}
                value={agent.business_rules}
                onChange={e => setAgent({ ...agent, business_rules: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                placeholder="Example: Never quote unlisted penthouse prices. Business hours are Mon-Fri 9-6."
              />
            </div>
          </div>
        )}

        {/* 6. Escalation Tab */}
        {activeTab === 'escalation' && (
          <div className="space-y-4 max-w-2xl">
            <h4 className="text-xs font-medium text-slate-300">Human Handoff Conditions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'human_request', label: 'Caller Requests Human Specialist' },
                { key: 'complaint', label: 'Customer Expresses Frustration / Complaint' },
                { key: 'refund', label: 'Billing Dispute or Refund Inquiry' },
                { key: 'high_value_lead', label: 'Ultra High Value Lead ($3M+ or VIP)' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(agent.escalation_rules as any)[item.key]}
                    onChange={e => setAgent({
                      ...agent,
                      escalation_rules: { ...agent.escalation_rules, [item.key]: e.target.checked }
                    })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Handoff Phone Number (SIP Target)</label>
              <input
                type="text"
                value={agent.escalation_rules.transfer_phone || ''}
                onChange={e => setAgent({
                  ...agent,
                  escalation_rules: { ...agent.escalation_rules, transfer_phone: e.target.value }
                })}
                placeholder="+1 (800) 577-KHAN"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* 7. Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-4 max-w-2xl">
            <div className="text-xs text-slate-400">
              The AI invokes these authorized tools to read verified records and modify business state.
            </div>
            <div className="space-y-2">
              {[
                { name: 'search_knowledge', desc: 'Queries verified business FAQs, documents, and pricing catalogs.' },
                { name: 'check_calendar_availability', desc: 'Checks live open calendar slots without double-booking.' },
                { name: 'book_appointment', desc: 'Reserves an appointment on Google Calendar and notifies client.' },
                { name: 'create_lead', desc: 'Persists prospect contact information and requirements into CRM.' },
                { name: 'transfer_to_human', desc: 'Generates internal summary and routes call to live human operator.' }
              ].map(tool => (
                <div key={tool.name} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <div className="text-xs font-mono font-semibold text-blue-400">{tool.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{tool.desc}</div>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium px-2 py-0.5">· Authorized</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Versions Tab */}
        {activeTab === 'versions' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Version History &amp; Auditable Rollbacks</h4>
            </div>

            <div className="space-y-2.5">
              {versions.map(v => (
                <div key={v.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">v{v.version_number}</span>
                      <span className="text-xs text-slate-400">· {v.status.toUpperCase()}</span>
                      {v.version_number === agent.current_version && (
                        <span className="text-xs text-blue-400 font-medium">· Current Live</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{v.notes || 'No change notes'}</p>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Created: {new Date(v.created_at).toLocaleString()}
                    </div>
                  </div>

                  {v.version_number !== agent.current_version && (
                    <button
                      onClick={() => handleRollback(v.version_number)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rollback</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. Interactive Sandbox */}
        {activeTab === 'test' && (
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-950 border border-slate-800 rounded-xl mb-3">
              {testMessages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.speaker === 'agent' ? 'items-start' : 'items-end'}`}>
                  <div className="text-[11px] text-slate-500 mb-0.5">
                    {m.speaker === 'agent' ? agent.name : 'You (Tester)'}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                      m.speaker === 'agent'
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.toolCall && (
                    <div className="text-[11px] font-mono text-blue-400 bg-slate-900 border border-blue-500/30 px-2 py-1 rounded mt-1">
                      Tool Invoked: {m.toolCall.name}
                    </div>
                  )}
                </div>
              ))}
              {isTestResponding && (
                <div className="text-xs text-slate-400 animate-pulse">Agent thinking...</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTestSend()}
                placeholder="Type test message..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleTestSend}
                disabled={!testInput.trim() || isTestResponding}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
