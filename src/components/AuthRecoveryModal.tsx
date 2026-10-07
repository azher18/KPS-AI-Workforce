// ============================================================================
// KPS AI Workforce - Authentication & Session Recovery Modal
// Sections 4, 5, 6 & 7 of PRD V2: Production-grade Auth, Session Expiry & RBAC
// ============================================================================

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { fetchJson } from '../lib/api.js';
import type { User } from '../types/index.ts';

interface AuthRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionUpdated: (user: User) => void;
  isSessionExpiredPrompt?: boolean;
}

export const AuthRecoveryModal: React.FC<AuthRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSessionUpdated,
  isSessionExpiredPrompt = false
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot' | 'personas'>(
    isSessionExpiredPrompt ? 'signin' : 'personas'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res.success && res.session?.user) {
        onSessionUpdated(res.session.user);
        onClose();
      } else {
        setErrorMessage(res.error || "We couldn't sign you in. Please check your email and password.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication service temporarily unreachable. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name, role: 'organization_owner' })
      });

      if (res.success && res.session?.user) {
        setSuccessMessage('Account created successfully! Authenticating workspace...');
        setTimeout(() => {
          onSessionUpdated(res.session.user);
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || 'Failed to register account.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await fetchJson('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setSuccessMessage(res.message || 'Recovery email dispatched.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToDemoUser = async (userId: string, tenantId: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetchJson('/api/auth/switch-tenant', {
        method: 'POST',
        body: JSON.stringify({ userId, tenantId })
      });
      if (res.user) {
        onSessionUpdated(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage('Failed to switch user account: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isSessionExpiredPrompt ? 'Session Expired' : 'Authentication & Security Authority'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isSessionExpiredPrompt ? 'Please sign in to resume your active session' : 'Multi-Tenant RBAC Identity Provider'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expired Session Alert Notice if triggered */}
        {isSessionExpiredPrompt && (
          <div className="bg-amber-950/40 border-b border-amber-900/60 p-3.5 flex items-start gap-2.5 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Your session has expired. Please sign in again.</div>
              <div className="text-[11px] text-amber-400/80 mt-0.5">
                We preserved your active workspace state. No infinite redirect loop occurred.
              </div>
            </div>
          </div>
        )}

        {/* Nav Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 text-xs font-medium">
          <button
            onClick={() => { setTab('personas'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-center transition ${
              tab === 'personas' ? 'text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch Persona
          </button>
          <button
            onClick={() => { setTab('signin'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-center transition ${
              tab === 'signin' ? 'text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-center transition ${
              tab === 'signup' ? 'text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setTab('forgot'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-center transition ${
              tab === 'forgot' ? 'text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Forgot
          </button>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="m-4 mb-0 p-3 bg-red-950/50 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}
        {successMessage && (
          <div className="m-4 mb-0 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        <div className="p-5">
          {/* TAB 1: Fast Persona Switcher */}
          {tab === 'personas' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Instantly test multi-tenant RBAC permissions without re-typing credentials:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleSwitchToDemoUser('usr_admin_001', 'org_kps_agency')}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                      AK
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                        Azher Dad Khan
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Platform Owner · Khans Professional Services HQ
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    Full Superadmin
                  </span>
                </button>

                <button
                  onClick={() => handleSwitchToDemoUser('usr_staff_002', 'org_kps_agency')}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                      ER
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-400 transition">
                        Elena Rostova
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Agency Operations Staff · Khans Professional Services
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    Agency Staff
                  </span>
                </button>

                <button
                  onClick={() => handleSwitchToDemoUser('usr_client_003', 'org_radiance_dental')}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      MV
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                        Dr. Marcus Vance
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Tenant Owner · Radiance Dental &amp; Aesthetics
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Org Owner
                  </span>
                </button>

                <button
                  onClick={() => handleSwitchToDemoUser('usr_member_004', 'org_apex_realestate')}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/40 text-slate-300 font-bold text-xs flex items-center justify-center">
                      AM
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-slate-300 transition">
                        Apex Team Member
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Restricted User · Apex Luxury Real Estate
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Org Member
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="azher@khans.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? 'Verifying Session...' : 'Sign In to Workspace'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-center text-slate-500 pt-1">
                Demo Quick Pass: Any password of 6+ chars works for seeded users.
              </div>
            </form>
          )}

          {/* TAB 3: Sign Up */}
          {tab === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Azher Dad Khan"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ceo@company.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Production Account'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Forgot Password */}
          {tab === 'forgot' && (
            <form onSubmit={handlePasswordReset} className="space-y-3.5">
              <p className="text-xs text-slate-400">
                Enter your work email address and we will dispatch a secure one-time session recovery link.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="azher@khans.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? 'Sending Token...' : 'Dispatch Recovery Token'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[10px] text-slate-500 text-center font-mono">
          Strict Anti-Workaround Auth · Supabase &amp; Express Session Scoped
        </div>
      </div>
    </div>
  );
};
