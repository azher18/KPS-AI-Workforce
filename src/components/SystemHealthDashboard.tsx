// ============================================================================
// KPS AI Workforce - System Health, Circuit Breakers & Observability Dashboard
// Sections 18, 19, 50, 51 & 82 of PRD V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Zap, 
  Clock, 
  RotateCcw, 
  Flame,
  Cpu
} from 'lucide-react';
import { fetchJson } from '../lib/api.js';

interface ServiceHealth {
  name: string;
  category: string;
  status: 'Operational' | 'Degraded' | 'Unavailable';
  latencyMs: number;
  lastChecked: string;
  consecutiveFailures: number;
  circuitState: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  incidentMessage?: string;
}

export const SystemHealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<{ overallStatus: string; services: ServiceHealth[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simulatedOutage, setSimulatedOutage] = useState<'none' | 'calendar' | 'voice'>('none');

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      const data = await fetchJson('/api/health');
      setHealthData(data);
    } catch (e) {
      console.error('Failed to load system health:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateOutage = async (service: 'none' | 'calendar' | 'voice') => {
    try {
      await fetchJson('/api/health/simulate-outage', {
        method: 'POST',
        body: JSON.stringify({ service })
      });
      setSimulatedOutage(service);
      await loadHealth();
    } catch (e) {
      console.error('Failed to simulate outage:', e);
    }
  };

  if (isLoading || !healthData) {
    return <div className="p-8 text-center text-slate-500 text-xs">Inspecting system architecture health...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Operational':
        return <span className="text-emerald-400 font-medium">· Operational</span>;
      case 'Degraded':
        return <span className="text-amber-400 font-medium">· Degraded</span>;
      default:
        return <span className="text-red-400 font-medium">· Unavailable</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">System Observability &amp; Health</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${
              healthData.overallStatus === 'Operational' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {healthData.overallStatus.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry, provider circuit breakers, and fault-tolerance verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Chaos Testing:</span>
          <button
            onClick={() => handleSimulateOutage(simulatedOutage === 'calendar' ? 'none' : 'calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              simulatedOutage === 'calendar'
                ? 'bg-red-950/80 text-red-300 border-red-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {simulatedOutage === 'calendar' ? 'Clear Calendar Outage' : 'Simulate Calendar Outage'}
          </button>
        </div>
      </div>

      {/* Simulated Outage Warning if Active */}
      {simulatedOutage !== 'none' && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-300">Failure Test Mode Active: {simulatedOutage.toUpperCase()} Outage</h4>
              <p className="text-amber-400/80 mt-0.5">
                Testing graceful degradation (PRD V2 Section 81). Autonomous agents will detect failure, capture leads, and issue callbacks without crashing.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSimulateOutage('none')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
          >
            Reset to Normal
          </button>
        </div>
      )}

      {/* Health Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthData.services.map(svc => {
          const isOperational = svc.status === 'Operational';
          return (
            <div
              key={svc.name}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-white">{svc.name}</h4>
                </div>
                {getStatusBadge(svc.status)}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-[11px] text-slate-500 block">Latency</span>
                  <span className="text-slate-200 font-mono">{svc.latencyMs}ms</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Circuit State</span>
                  <span className={`font-mono font-semibold ${
                    svc.circuitState === 'CLOSED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {svc.circuitState}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Failures</span>
                  <span className="text-slate-200 font-mono">{svc.consecutiveFailures}</span>
                </div>
              </div>

              {svc.incidentMessage && (
                <div className="text-[11px] text-amber-400/90 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                  {svc.incidentMessage}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
