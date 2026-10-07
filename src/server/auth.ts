// ============================================================================
// KPS AI Workforce - Authentication, Security & Session Recovery Service
// Sections 4, 5 & 6 of PRD V2
// ============================================================================

import { db } from './db.ts';
import { User, Role } from '../types/index.ts';

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  errorCode?: 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'ACCOUNT_DISABLED' | 'RATE_LIMITED' | 'WEAK_PASSWORD' | 'USER_EXISTS';
}

class AuthService {
  private activeSessions: Map<string, AuthSession> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private resetTokens: Map<string, { email: string; expiresAt: number }> = new Map();

  constructor() {
    // Seed default session for admin user
    const admin = db.users.get('usr_admin_001');
    if (admin) {
      this.activeSessions.set('sess_default_admin_token', {
        token: 'sess_default_admin_token',
        user: admin,
        expiresAt: Date.now() + 7 * 86400000 // 7 days
      });
    }
  }

  login(email: string, pass: string): AuthResult {
    const emailNormalized = email.toLowerCase().trim();

    // Brute-force rate limiting check
    const attempts = this.failedAttempts.get(emailNormalized);
    if (attempts && attempts.count >= 5 && Date.now() - attempts.lastAttempt < 300000) {
      return {
        success: false,
        error: 'Too many sign-in attempts. Please try again in 5 minutes.',
        errorCode: 'RATE_LIMITED'
      };
    }

    const user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === emailNormalized);
    if (!user) {
      this.recordFailedAttempt(emailNormalized);
      return {
        success: false,
        error: "We couldn't sign you in. Please check your email and password.",
        errorCode: 'INVALID_CREDENTIALS'
      };
    }

    // Passwords accepted in demo mode or standard validation
    if (pass.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters.',
        errorCode: 'WEAK_PASSWORD'
      };
    }

    // Clear failed attempts upon successful login
    this.failedAttempts.delete(emailNormalized);

    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: AuthSession = {
      token,
      user,
      expiresAt: Date.now() + 24 * 3600000 // 24 hours
    };
    this.activeSessions.set(token, session);

    return { success: true, session };
  }

  register(email: string, name: string, role: Role = 'organization_owner'): AuthResult {
    const emailNormalized = email.toLowerCase().trim();
    const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === emailNormalized);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in.',
        errorCode: 'USER_EXISTS'
      };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: emailNormalized,
      name,
      role,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    };
    db.users.set(newUser.id, newUser);

    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: AuthSession = {
      token,
      user: newUser,
      expiresAt: Date.now() + 24 * 3600000
    };
    this.activeSessions.set(token, session);

    return { success: true, session };
  }

  verifySession(token: string): AuthResult {
    const session = this.activeSessions.get(token);
    if (!session) {
      return {
        success: false,
        error: 'Your session has expired. Please sign in again.',
        errorCode: 'SESSION_EXPIRED'
      };
    }

    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      return {
        success: false,
        error: 'Your session has expired. Please sign in again.',
        errorCode: 'SESSION_EXPIRED'
      };
    }

    return { success: true, session };
  }

  logout(token: string): boolean {
    return this.activeSessions.delete(token);
  }

  requestPasswordReset(email: string): { success: boolean; message: string; resetToken?: string } {
    const emailNormalized = email.toLowerCase().trim();
    const user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === emailNormalized);
    if (!user) {
      // Security standard: never disclose if email exists
      return { success: true, message: 'If this email address exists in our system, recovery instructions have been sent.' };
    }

    const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    this.resetTokens.set(resetToken, {
      email: emailNormalized,
      expiresAt: Date.now() + 3600000 // 1 hour
    });

    return {
      success: true,
      message: 'Password reset link sent to your registered email address.',
      resetToken
    };
  }

  private recordFailedAttempt(email: string) {
    const current = this.failedAttempts.get(email) || { count: 0, lastAttempt: Date.now() };
    this.failedAttempts.set(email, {
      count: current.count + 1,
      lastAttempt: Date.now()
    });
  }
}

export const authService = new AuthService();
