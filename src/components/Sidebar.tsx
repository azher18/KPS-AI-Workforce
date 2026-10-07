// ============================================================================
// KPS AI Workforce - Responsive Application Sidebar
// ============================================================================

import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  PhoneCall, 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  Cpu, 
  BarChart3, 
  CreditCard, 
  ShieldAlert, 
  Building2, 
  LifeBuoy, 
  FileText,
  Settings,
  Phone,
  ShieldCheck,
  Activity,
  Database
} from 'lucide-react';
import type { Role } from '../types/index.ts';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  role: Role;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  onSimulateCall: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  role,
  isAdminMode,
  onToggleAdminMode,
  onSimulateCall
}) => {
  const isPlatformOwner = role === 'platform_owner';

  const businessNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'AI Employees', icon: Bot },
    { id: 'calls', label: 'Call Records', icon: PhoneCall },
    { id: 'leads', label: 'Leads CRM', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'followups', label: 'Follow-Ups', icon: Clock },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'integrations', label: 'Integrations', icon: Cpu },
    { id: 'privacy', label: 'Privacy & Retention', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics & ROI', icon: BarChart3 },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard }
  ];

  const adminNav = [
    { id: 'agency-overview', label: 'HQ Overview', icon: Building2 },
    { id: 'agency-clients', label: 'Client Accounts', icon: Users },
    { id: 'calls', label: 'Global Calls', icon: PhoneCall },
    { id: 'health', label: 'Observability & Health', icon: Activity },
    { id: 'schema', label: 'Database & DR', icon: Database },
    { id: 'billing', label: 'Plans & Metering', icon: CreditCard },
    { id: 'audit', label: 'Audit Trail', icon: FileText }
  ];

  const navItems = isAdminMode ? adminNav : businessNav;

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            K
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">KPS AI Workforce</h1>
            <span className="text-[10px] text-blue-400 font-mono block -mt-0.5">Autonomous SaaS</span>
          </div>
        </div>

        {/* Quick Launch Phone Call Button */}
        <div className="p-3">
          <button
            onClick={onSimulateCall}
            className="w-full py-2.5 px-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-3.5 h-3.5 animate-pulse" />
            <span>Simulate Inbound Call</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mode Switcher for Agency Staff / Platform Owner */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {isPlatformOwner && (
          <button
            onClick={onToggleAdminMode}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAdminMode ? 'Switch to Client View' : 'Agency HQ Portal'}</span>
          </button>
        )}

        <div className="text-[11px] text-slate-500 text-center font-mono">
          Khans Professional Services © 2026
        </div>
      </div>
    </aside>
  );
};
