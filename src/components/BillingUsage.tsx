// ============================================================================
// KPS AI Workforce - SaaS Billing, Plans & Usage Metering
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Zap, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { fetchJson } from '../lib/api.js';

export const BillingUsage: React.FC = () => {
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson('/api/billing/subscription');
      setBillingData(data);
    } catch (e) {
      console.error('Failed to load billing:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgradingPlan(planId);
    try {
      await fetchJson('/api/billing/upgrade', {
        method: 'POST',
        body: JSON.stringify({ planId, billingCycle: 'monthly' })
      });
      await loadBilling();
    } catch (e) {
      console.error('Failed to upgrade:', e);
    } finally {
      setUpgradingPlan(null);
    }
  };

  if (isLoading || !billingData) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading billing details...</div>;
  }

  const { subscription, plan, usage, invoices } = billingData;
  const isNearLimit = usage.warningLevel === 'warning_80' || usage.warningLevel === 'warning_90';
  const isAtLimit = usage.warningLevel === 'limit_100';

  const plansList = [
    {
      id: 'STARTER',
      name: 'Starter',
      price: '$129',
      priceInr: '₹9,999',
      desc: 'Essential AI Receptionist for boutique businesses',
      features: ['1 Autonomous AI Employee', '500 Voice Minutes / mo', 'Google Calendar Sync', 'Standard Lead CRM', 'Email Alerts']
    },
    {
      id: 'GROWTH',
      name: 'Growth',
      price: '$249',
      priceInr: '₹19,999',
      desc: 'Flagship multi-agent workforce for scaling service companies',
      features: ['3 Autonomous AI Employees', '1,500 Voice Minutes / mo', 'Smart Lead Scoring (0-100)', 'Event-Driven Follow-Ups', 'Live Human Handoff with Summaries', 'Advanced Analytics']
    },
    {
      id: 'AGENCY',
      name: 'Agency Managed',
      price: '$499',
      priceInr: '₹39,999',
      desc: 'White-glove deployment with custom workflows and dedicated support',
      features: ['10 Autonomous AI Employees', '5,000 Voice Minutes / mo', 'Multiple Business Locations', 'Dedicated Telephony Trunking', 'Custom Knowledge Vectors', 'n8n Webhook Automations', 'Dedicated KPS Account Lead']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Subscription &amp; Usage Metering</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your plan, monitor live telephony consumption, and view invoices.
        </p>
      </div>

      {/* Warning Notice if at 80% or 90% */}
      {isNearLimit && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-300">Approaching Voice Quota Limit ({usage.percentage}%)</h4>
              <p className="text-amber-400/80 mt-0.5">
                You have used {usage.usedMinutes} of {usage.limitMinutes} included minutes this billing period.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleUpgrade('GROWTH')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-semibold"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Live Usage Metering Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Current Usage Consumption</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Plan: <strong className="text-white">{plan.name}</strong> ({subscription.billing_cycle})
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Monthly Voice Quota</div>
            <div className="text-lg font-bold font-mono text-white">
              {usage.usedMinutes} <span className="text-xs text-slate-500 font-normal">/ {usage.limitMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usage.percentage >= 90 ? 'bg-red-500' :
                usage.percentage >= 80 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, usage.percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>0 min</span>
            <span>Warn at 80%</span>
            <span>Limit {usage.limitMinutes} min</span>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">Total Calls</span>
            <span className="text-slate-200 font-mono font-medium">{usage.callsCount}</span>
          </div>
          <div>
            <span className="text-slate-500 block">AI Inferences</span>
            <span className="text-slate-200 font-mono font-medium">{usage.aiRequests}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Web Chat Messages</span>
            <span className="text-slate-200 font-mono font-medium">{usage.chatMessages}</span>
          </div>
          <div>
            <span className="text-slate-500 block">SMS Follow-ups</span>
            <span className="text-slate-200 font-mono font-medium">{usage.smsCount}</span>
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plansList.map(p => {
            const isCurrent = subscription.plan_id === p.id;
            return (
              <div
                key={p.id}
                className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between ${
                  isCurrent ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{p.name}</h4>
                    {isCurrent && (
                      <span className="text-[11px] font-mono font-semibold text-blue-400">
                        · Current Plan
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2">
                    {p.price} <span className="text-xs text-slate-400 font-normal">/ month</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-3">{p.priceInr} / mo (India)</div>
                  <p className="text-xs text-slate-400 mb-4">{p.desc}</p>

                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={isCurrent || upgradingPlan === p.id}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : upgradingPlan === p.id ? 'Upgrading...' : `Switch to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Billing History &amp; Invoices</span>
        </h3>

        <div className="divide-y divide-slate-800/80">
          {invoices.length === 0 ? (
            <div className="text-xs text-slate-500 py-4">No invoices on file.</div>
          ) : (
            invoices.map((inv: any) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{inv.invoice_number}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(inv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-slate-200 font-semibold">${inv.amount}</span>
                  <span className="text-emerald-400 font-medium">· Paid</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
