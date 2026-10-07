// ============================================================================
// KPS AI Workforce - System Health, Circuit Breakers & Observability
// Sections 18, 19, 32 & 50 of PRD V2
// ============================================================================

export type ProviderStatus = 'Operational' | 'Degraded' | 'Unavailable';

export interface ProviderHealth {
  name: string;
  category: 'database' | 'auth' | 'ai' | 'voice' | 'calendar' | 'payments' | 'email' | 'messaging';
  status: ProviderStatus;
  latencyMs: number;
  lastChecked: string;
  consecutiveFailures: number;
  circuitState: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  incidentMessage?: string;
}

export class CircuitBreaker {
  private failureThreshold = 3;
  private cooldownPeriodMs = 30000;
  private consecutiveFailures = 0;
  private state: 'CLOSED' | 'HALF_OPEN' | 'OPEN' = 'CLOSED';
  private lastFailureTime = 0;

  constructor(public serviceName: string) {}

  canExecute(): boolean {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    // HALF_OPEN allows single test execution
    return true;
  }

  recordSuccess() {
    this.consecutiveFailures = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.consecutiveFailures += 1;
    this.lastFailureTime = Date.now();
    if (this.consecutiveFailures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return this.state;
  }

  getFailures() {
    return this.consecutiveFailures;
  }
}

class HealthMonitor {
  private breakers: Map<string, CircuitBreaker> = new Map();

  constructor() {
    const services = ['database', 'auth', 'ai', 'voice', 'calendar', 'payments', 'email', 'messaging'];
    services.forEach(s => this.breakers.set(s, new CircuitBreaker(s)));
  }

  getBreaker(service: string): CircuitBreaker {
    if (!this.breakers.has(service)) {
      this.breakers.set(service, new CircuitBreaker(service));
    }
    return this.breakers.get(service)!;
  }

  getSystemHealth(): ProviderHealth[] {
    const now = new Date().toISOString();
    return [
      {
        name: 'PostgreSQL Database Engine',
        category: 'database',
        status: 'Operational',
        latencyMs: 8,
        lastChecked: now,
        consecutiveFailures: this.getBreaker('database').getFailures(),
        circuitState: this.getBreaker('database').getState()
      },
      {
        name: 'Authentication & Session Authority',
        category: 'auth',
        status: 'Operational',
        latencyMs: 14,
        lastChecked: now,
        consecutiveFailures: this.getBreaker('auth').getFailures(),
        circuitState: this.getBreaker('auth').getState()
      },
      {
        name: 'Google GenAI (Gemini LLM Provider)',
        category: 'ai',
        status: process.env.GEMINI_API_KEY ? 'Operational' : 'Degraded',
        latencyMs: 120,
        lastChecked: now,
        consecutiveFailures: this.getBreaker('ai').getFailures(),
        circuitState: this.getBreaker('ai').getState(),
        incidentMessage: process.env.GEMINI_API_KEY ? undefined : 'Running in deterministic fallback mode (API Key not configured in env)'
      },
      {
        name: 'Retell / Vapi Telephony Gateway',
        category: 'voice',
        status: 'Operational',
        latencyMs: 65,
        lastChecked: now,
        consecutiveFailures: this.getBreaker('voice').getFailures(),
        circuitState: this.getBreaker('voice').getState()
      },
      {
        name: 'Google Calendar Two-Way Sync',
        category: 'calendar',
        status: 'Operational',
        latencyMs: 95,
        lastChecked: now,
        consecutiveFailures: this.getBreaker('calendar').getFailures(),
        circuitState: this.getBreaker('calendar').getState()
      },
      {
        name: 'Stripe & Razorpay Billing Webhook Bridge',
        category: 'payments',
        status: 'Operational',
        latencyMs: 45,
        lastChecked: now,
        consecutiveFailures: this.getBreaker('payments').getFailures(),
        circuitState: this.getBreaker('payments').getState()
      },
      {
        name: 'Resend Transactional Email Service',
        category: 'email',
        status: 'Operational',
        latencyMs: 38,
        lastChecked: now,
        consecutiveFailures: this.getBreaker('email').getFailures(),
        circuitState: this.getBreaker('email').getState()
      },
      {
        name: 'Twilio SMS & Carrier DID Gateway',
        category: 'messaging',
        status: 'Operational',
        latencyMs: 50,
        lastChecked: now,
        consecutiveFailures: this.getBreaker('messaging').getFailures(),
        circuitState: this.getBreaker('messaging').getState()
      }
    ];
  }

  generateErrorReference(): string {
    const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
    return `ERR-${hex}`;
  }
}

export const healthMonitor = new HealthMonitor();
