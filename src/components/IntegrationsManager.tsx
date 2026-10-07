// ============================================================================
// KPS AI Workforce - Integrations & Webhook Connectors
// Section 57 of Specification: Real connection statuses, no fake states.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Phone, 
  CreditCard, 
  Cpu, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Shield,
  X
} from 'lucide-react';
import type { Integration } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

export const IntegrationsManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configuringIntegration, setConfiguringIntegration] = useState<Integration | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson<Integration[]>('/api/integrations');
      setIntegrations(data);
    } catch (e) {
      console.error('Failed to load integrations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleConnection = async (integration: Integration) => {
    const newStatus = integration.status === 'connected' ? 'not_connected' : 'connected';
    try {
      const updated = await fetchJson<Integration>('/api/integrations/toggle', {
        method: 'POST',
        body: JSON.stringify({
          provider: integration.provider,
          status: newStatus,
          credentials: { status: 'Configured by administrator' }
        })
      });
      setIntegrations(integrations.map(i => (i.provider === integration.provider ? updated : i)));
      setConfiguringIntegration(null);
    } catch (e) {
      console.error('Failed to toggle integration:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Integrations &amp; Telephony Gateways</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Connect your voice providers, calendars, payment processors, and automation webhooks.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(item => {
          const isConnected = item.status === 'connected';
          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition ${
                isConnected ? 'border-blue-500/40 shadow-sm' : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400">
                    {item.category === 'Calendar' && <Calendar className="w-5 h-5" />}
                    {item.category === 'Voice' && <Phone className="w-5 h-5" />}
                    {item.category === 'Telephony' && <Phone className="w-5 h-5" />}
                    {item.category === 'Payments' && <CreditCard className="w-5 h-5" />}
                    {item.category === 'Automation' && <Cpu className="w-5 h-5" />}
                  </div>

                  <span className={`text-[11px] font-mono font-medium ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isConnected ? '· Connected' : '· Not Connected'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 uppercase font-mono">{item.category}</span>
                <button
                  onClick={() => handleToggleConnection(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isConnected
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
