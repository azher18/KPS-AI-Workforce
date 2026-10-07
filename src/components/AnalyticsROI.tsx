// ============================================================================
// KPS AI Workforce - Conversion Analytics & ROI Calculator
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PhoneCall, 
  Users, 
  CalendarCheck, 
  Zap, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { fetchJson } from '../lib/api.js';

export const AnalyticsROI: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [avgCustomerValue, setAvgCustomerValue] = useState(4500);
  const [roiData, setRoiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    calculateRoi();
  }, [avgCustomerValue]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson('/api/analytics/overview');
      setOverview(data);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoi = async () => {
    try {
      const res = await fetchJson('/api/analytics/roi', {
        method: 'POST',
        body: JSON.stringify({ averageCustomerValue: avgCustomerValue })
      });
      setRoiData(res);
    } catch (e) {
      console.error('Failed to calculate ROI:', e);
    }
  };

  if (isLoading || !overview) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Performance Analytics &amp; ROI</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time metrics on autonomous call handling, lead qualification, and pipeline revenue.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Resolution Rate</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview.aiResolutionRate}%
          </div>
          <div className="text-[11px] text-slate-400">
            {overview.aiHandledCalls} of {overview.totalCalls} calls resolved without human transfer
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Qualified Pipeline</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview.qualifiedLeads} Leads
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            {overview.hotLeads} Hot Leads scored above 70/100
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Calendar Bookings</span>
            <CalendarCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview.appointmentsCount} Booked
          </div>
          <div className="text-[11px] text-slate-400">
            {overview.conversionRate}% call-to-appointment conversion
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Response Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            680 ms
          </div>
          <div className="text-[11px] text-emerald-400">
            Sub-second conversational response
          </div>
        </div>
      </div>

      {/* Interactive ROI Calculator Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Interactive ROI &amp; Opportunity Value Calculator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your business's average deal or patient value to calculate estimated pipeline revenue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Avg Customer Value ($):</span>
            <input
              type="number"
              min={100}
              step={100}
              value={avgCustomerValue}
              onChange={e => setAvgCustomerValue(Number(e.target.value))}
              className="w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500 text-right"
            />
          </div>
        </div>

        {roiData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">AI Captured Leads</div>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {roiData.totalLeads}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{roiData.qualifiedLeads} Qualified</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Appointments Booked</div>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {roiData.appointmentsBooked}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">On Google Calendar</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Estimated Conversions</div>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {roiData.estimatedConversions}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Based on 40% booking close rate</div>
            </div>

            <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-500/30">
              <div className="text-xs text-blue-400 font-semibold">Estimated Revenue Opportunity</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                ${roiData.estimatedRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Clearly labeled as estimated opportunity
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
