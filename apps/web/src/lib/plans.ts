import "server-only";

import { eq, and, count } from "drizzle-orm";
import { db } from "@/db";
import { subscription, watchlist } from "@/db/schema";

export type PlanId = "free" | "unlimited";

export interface PlanLimits {
  maxAlerts: number;
  canReceiveAlerts: boolean;
  maxWatchlists: number;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    maxAlerts: 0,
    canReceiveAlerts: false,
    maxWatchlists: 1,
  },
  unlimited: {
    maxAlerts: Number.MAX_SAFE_INTEGER,
    canReceiveAlerts: true,
    maxWatchlists: Number.MAX_SAFE_INTEGER,
  },
};

export async function getUserPlan(userId: string): Promise<PlanId> {
  const [row] = await db
    .select({ plan: subscription.plan })
    .from(subscription)
    .where(and(eq(subscription.userId, userId), eq(subscription.status, "active")))
    .limit(1);

  return (row?.plan as PlanId) ?? "free";
}

export async function canCreateWatchlist(
  userId: string,
): Promise<{ allowed: boolean; current: number; max: number }> {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  const [{ value: current }] = await db
    .select({ value: count() })
    .from(watchlist)
    .where(eq(watchlist.userId, userId));

  return {
    allowed: current < limits.maxWatchlists,
    current,
    max: limits.maxWatchlists,
  };
}
