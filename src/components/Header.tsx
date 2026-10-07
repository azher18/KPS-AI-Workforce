// ============================================================================
// KPS AI Workforce - Top Header & Multi-Tenant Switcher
// ============================================================================

import React from 'react';
import { 
  Building2, 
  ChevronDown, 
  ShieldCheck, 
  User, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  LogOut,
  Plus
} from 'lucide-react';
import type { Organization, User as UserType } from '../types/index.ts';

interface HeaderProps {
  currentUser: UserType | null;
  activeOrg: Organization | null;
  accessibleOrgs: Organization[];
  onSwitchTenant: (orgId: string) => void;
  isImpersonating: boolean;
  onStopImpersonating: () => void;
  onOpenMarketing: () => void;
  onStartOnboarding: () => void;
  onOpenAuth: () => void;
  onSimulateSessionExpire: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeOrg,
  accessibleOrgs,
  onSwitchTenant,
  isImpersonating,
  onStopImpersonating,
  onOpenMarketing,
  onStartOnboarding,
  onOpenAuth,
  onSimulateSessionExpire
}) => {
  return (
    <header className="h-16 bg-[#0a0f1d] border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Tenant Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-500 font-medium">Tenant:</span>
          
          <select
            value={activeOrg?.id || ''}
            onChange={e => onSwitchTenant(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {accessibleOrgs.map(org => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.industry})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onStartOnboarding}
          className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 ml-2 transition"
          title="Onboard a new business organization"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Tenant</span>
        </button>

        {isImpersonating && (
          <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs px-2.5 py-1 rounded-md">
            <span>Impersonating {activeOrg?.name}</span>
            <button
              onClick={onStopImpersonating}
              className="text-[11px] underline font-bold hover:text-white ml-1"
            >
              Exit
            </button>
          </div>
        )}
      </div>

      {/* Right: User Profile & Public Site Link & Auth Actions */}
      <div className="flex items-center gap-3 text-xs">
        {/* Test Expire Session button for PRD Section 4 verification */}
        <button
          onClick={onSimulateSessionExpire}
          title="Test production session expiry recovery without breaking page"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 text-[11px] transition"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Test Session Expiry</span>
        </button>

        <button
          onClick={onOpenMarketing}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition px-2 py-1 rounded-lg hover:bg-slate-800/50"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Marketing Page</span>
        </button>

        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

        {/* User Card with click to switch account */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition text-left"
          title="Switch user account, sign in, or manage authentication"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-xs">
            {currentUser?.name.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-semibold text-white leading-tight flex items-center gap-1">
              <span>{currentUser?.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-[10px] text-blue-400 font-mono">
              {currentUser?.role === 'platform_owner'
                ? 'Platform Owner (KPS)'
                : currentUser?.role === 'agency_staff'
                ? 'Agency Operations Staff'
                : currentUser?.role === 'organization_owner'
                ? 'Organization Owner'
                : 'Organization Member'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
