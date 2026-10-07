// ============================================================================
// KPS AI Workforce - Privacy, Recording Consent & Retention Settings
// Sections 38, 46, 47 & 48 of PRD V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { fetchJson } from '../lib/api.js';

export const PrivacySettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState('');
  const [deletionMessage, setDeletionMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson('/api/privacy');
      setSettings(data);
    } catch (e) {
      console.error('Failed to load privacy settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await fetchJson('/api/privacy', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      });
      setSettings(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      console.error('Failed to update privacy settings:', e);
    }
  };

  const handlePurgeCustomer = async () => {
    if (!customerToDeleteId.trim()) return;
    if (!confirm('Are you sure you want to permanently scrub all customer personal data in compliance with privacy retention laws?')) return;

    try {
      const res = await fetchJson(`/api/privacy/customers/${customerToDeleteId}/purge`, {
        method: 'POST'
      });
      setDeletionMessage(res.message);
      setCustomerToDeleteId('');
      setTimeout(() => setDeletionMessage(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Customer deletion failed');
    }
  };

  if (isLoading || !settings) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading privacy controls...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Privacy &amp; Telephony Compliance</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure AI disclosures, recording consent, and automated GDPR/CCPA data retention.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Call Recording &amp; AI Disclosure Guardrails</span>
          </h3>
          {isSaved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved
            </span>
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.ai_disclosure_enabled}
              onChange={e => setSettings({ ...settings, ai_disclosure_enabled: e.target.checked })}
              className="mt-1 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
            />
            <div>
              <div className="text-xs font-semibold text-white">Mandatory AI Disclosure Announcement</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically announces to incoming callers that the conversation is assisted by an autonomous AI employee.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.call_recording_enabled}
              onChange={e => setSettings({ ...settings, call_recording_enabled: e.target.checked })}
              className="mt-1 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
            />
            <div>
              <div className="text-xs font-semibold text-white">Inbound Call Audio Recording</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Record audio for compliance, quality assurance, and automated transcript generation.
              </p>
            </div>
          </label>
        </div>

        {/* Disclosure Message */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Opening Disclosure / Consent Notice
          </label>
          <textarea
            rows={2}
            value={settings.disclosure_message}
            onChange={e => setSettings({ ...settings, disclosure_message: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
          />
        </div>

        {/* Retention Days */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Automated Transcript &amp; Audio Retention Period
          </label>
          <select
            value={settings.transcript_retention_days}
            onChange={e => setSettings({ ...settings, transcript_retention_days: Number(e.target.value) })}
            className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value={30}>30 Days Retention</option>
            <option value={60}>60 Days Retention</option>
            <option value={90}>90 Days Retention (Standard)</option>
            <option value={180}>180 Days Retention</option>
            <option value={365}>365 Days Retention</option>
          </select>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Compliance Settings</span>
          </button>
        </div>
      </form>

      {/* Customer Data Scrubbing / Right to be Forgotten */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>Customer Data Scrubbing &amp; GDPR Erasure</span>
        </h3>
        <p className="text-xs text-slate-400">
          Permanently redact personal identifying records (name, phone, email, transcripts) upon consumer request while retaining financial transaction records for audit law.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customerToDeleteId}
            onChange={e => setCustomerToDeleteId(e.target.value)}
            placeholder="Enter Customer ID (e.g. cust_apex_101)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
          />
          <button
            type="button"
            onClick={handlePurgeCustomer}
            disabled={!customerToDeleteId.trim()}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-700/60 disabled:opacity-50 rounded-lg text-xs font-semibold transition"
          >
            Purge Customer Data
          </button>
        </div>

        {deletionMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
            {deletionMessage}
          </div>
        )}
      </div>
    </div>
  );
};
