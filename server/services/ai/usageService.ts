/**
 * Centralized Usage Tracking & Entitlement Service
 * Tracks AI requests and enforces role/plan entitlement limits.
 */

import { DBAIUsage, DBUser, OWNER_EMAIL } from '../../db/schema.js';

export interface UsageSummary {
  plan: string;
  isOwner: boolean;
  totalRequests: number;
  dailyRequestsUsed: number;
  dailyLimit: number; // -1 for unlimited
  remainingCredits: number;
  canRequest: boolean;
  reason?: string;
}

// In-Memory usage log store
const usageLogs: DBAIUsage[] = [];

const TIER_LIMITS: Record<string, number> = {
  lifetime_free: -1, // Unlimited for platform owner
  pro: 500,          // 500 AI calls/day
  starter: 100,      // 100 AI calls/day
  free: 30,          // 30 AI calls/day
};

export function logAIUsage(
  userId: string,
  feature: DBAIUsage['feature'],
  status: 'SUCCESS' | 'FAILED' = 'SUCCESS',
  promptTokens = 150,
  completionTokens = 250
): DBAIUsage {
  const log: DBAIUsage = {
    id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    feature,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    status,
    createdAt: new Date().toISOString(),
  };

  usageLogs.unshift(log);
  return log;
}

export function getUserUsageSummary(user?: Partial<DBUser>): UsageSummary {
  const isOwner = user?.isOwner || user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const plan = isOwner ? 'lifetime_free' : (user?.plan || 'free');

  const dailyLimit = TIER_LIMITS[plan] ?? 30;

  // Calculate today's requests
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayLogs = usageLogs.filter((log) => {
    if (user?.id && log.userId !== user.id) return false;
    return new Date(log.createdAt) >= startOfDay;
  });

  const dailyRequestsUsed = todayLogs.length;

  if (dailyLimit === -1) {
    return {
      plan,
      isOwner: true,
      totalRequests: usageLogs.filter(l => !user?.id || l.userId === user.id).length,
      dailyRequestsUsed,
      dailyLimit: -1,
      remainingCredits: 99999,
      canRequest: true,
    };
  }

  const remainingCredits = Math.max(0, dailyLimit - dailyRequestsUsed);
  const canRequest = remainingCredits > 0;

  return {
    plan,
    isOwner: false,
    totalRequests: usageLogs.filter(l => !user?.id || l.userId === user.id).length,
    dailyRequestsUsed,
    dailyLimit,
    remainingCredits,
    canRequest,
    reason: canRequest ? undefined : `Daily AI generation limit reached (${dailyLimit}/${dailyLimit}). Upgrade to Pro for 500 daily generations.`,
  };
}

export function getUsageLogs(): DBAIUsage[] {
  return usageLogs;
}
