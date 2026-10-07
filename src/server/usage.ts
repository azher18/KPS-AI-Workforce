// ============================================================================
// KPS AI Workforce - Server-Side Usage Enforcement & Rate Cards
// Sections 22, 23, 24, 25 & 69 of PRD V2
// ============================================================================

import { db, PLANS } from './db.ts';

export type UsageState = 'normal' | 'warning' | 'critical' | 'exhausted';

export interface UsageQuotaCheck {
  allowed: boolean;
  state: UsageState;
  usedMinutes: number;
  limitMinutes: number;
  percentage: number;
  overageMinutes: number;
  overageEstimatedCost: number;
  message?: string;
}

export class UsageEnforcementService {
  // Overage Rates
  static readonly VOICE_OVERAGE_PER_MINUTE_USD = 0.15;
  static readonly AI_OVERAGE_PER_1K_REQUESTS_USD = 2.0;

  static checkQuota(tenantId: string, additionalMinutes = 1): UsageQuotaCheck {
    const sub = db.getSubscription(tenantId);
    const plan = PLANS[sub?.plan_id || 'STARTER'] || PLANS.STARTER;
    const records = db.getUsageRecords(tenantId);
    const todayUsage = records[0];

    const usedSeconds = todayUsage?.voice_seconds || 0;
    const usedMinutes = Math.round(usedSeconds / 60);
    const limitMinutes = plan.voice_minutes_included;

    const projectedMinutes = usedMinutes + additionalMinutes;
    const percentage = Math.round((projectedMinutes / limitMinutes) * 100);

    let state: UsageState = 'normal';
    if (percentage >= 100) state = 'exhausted';
    else if (percentage >= 90) state = 'critical';
    else if (percentage >= 80) state = 'warning';

    const overageMinutes = Math.max(0, projectedMinutes - limitMinutes);
    const overageEstimatedCost = Math.round(overageMinutes * this.VOICE_OVERAGE_PER_MINUTE_USD * 100) / 100;

    // Hard limit rule: if status is cancelled or past_due or limit exceeded on Starter plan
    if (sub?.status === 'past_due' || sub?.status === 'canceled') {
      return {
        allowed: false,
        state: 'exhausted',
        usedMinutes,
        limitMinutes,
        percentage,
        overageMinutes,
        overageEstimatedCost,
        message: 'Subscription payment requires attention. Please update your billing method.'
      };
    }

    if (percentage > 105 && sub?.plan_id === 'STARTER') {
      return {
        allowed: false,
        state: 'exhausted',
        usedMinutes,
        limitMinutes,
        percentage,
        overageMinutes,
        overageEstimatedCost,
        message: `Monthly voice quota exhausted (${usedMinutes}/${limitMinutes} min). Upgrade to Growth plan to continue placing live calls.`
      };
    }

    return {
      allowed: true,
      state,
      usedMinutes,
      limitMinutes,
      percentage,
      overageMinutes,
      overageEstimatedCost,
      message: state === 'warning' || state === 'critical'
        ? `Approaching monthly voice quota (${percentage}% utilized).`
        : undefined
    };
  }

  static getOverageCard(tenantId: string) {
    const sub = db.getSubscription(tenantId);
    const plan = PLANS[sub?.plan_id || 'STARTER'] || PLANS.STARTER;
    const quota = this.checkQuota(tenantId, 0);

    return {
      planName: plan.name,
      billingCycle: sub?.billing_cycle || 'monthly',
      includedMinutes: plan.voice_minutes_included,
      currentUsageMinutes: quota.usedMinutes,
      percentage: quota.percentage,
      state: quota.state,
      overageMinutes: quota.overageMinutes,
      overageRatePerMinute: `$${this.VOICE_OVERAGE_PER_MINUTE_USD}/min`,
      projectedOverageCost: quota.overageEstimatedCost,
      nextBillingDate: sub?.current_period_end || new Date(Date.now() + 30 * 86400000).toISOString()
    };
  }
}
