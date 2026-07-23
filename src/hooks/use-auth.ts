'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  clearSession,
  fetchMe,
  getSession,
  logoutUser,
  type AuthSession
} from '@/lib/auth';
import {
  getCurrentPlan,
  getCurrentPlanId,
  getToolUsageProgress,
  hydrateBillingFromServer,
  type ToolUsageProgress
} from '@/lib/billing';
import type { Plan, PlanId } from '@/lib/plans';

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [plan, setPlan] = useState<Plan>(getCurrentPlan());
  const [planId, setPlanId] = useState<PlanId>(getCurrentPlanId());
  const [usage, setUsage] = useState<ToolUsageProgress>(getToolUsageProgress());
  const [ready, setReady] = useState(false);

  const syncFromCache = useCallback(() => {
    setSession(getSession());
    setPlan(getCurrentPlan());
    setPlanId(getCurrentPlanId());
    setUsage(getToolUsageProgress());
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMe();
      if (data.authenticated) {
        hydrateBillingFromServer({
          planId: data.planId as PlanId,
          usage: data.usage as ToolUsageProgress
        });
      } else {
        clearSession();
        hydrateBillingFromServer({
          planId: 'gratis',
          usage: {
            current: 0,
            limit: null,
            unlimited: false,
            remaining: null,
            ratio: 0,
            exhaustedAt: null,
            nextReleaseAt: null,
            premiumExpiresAt: null
          }
        });
      }
    } catch {
      // mantém cache local
    }
    syncFromCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resolva-jato-auth-change'));
    }
  }, [syncFromCache]);

  useEffect(() => {
    function handleChange() {
      syncFromCache();
    }
    void (async () => {
      await refresh();
      setReady(true);
    })();
    window.addEventListener('storage', handleChange);
    window.addEventListener('resolva-jato-auth-change', handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('resolva-jato-auth-change', handleChange);
    };
  }, [refresh, syncFromCache]);

  async function logout() {
    await logoutUser();
    hydrateBillingFromServer({
      planId: 'gratis',
      usage: {
        current: 0,
        limit: null,
        unlimited: false,
        remaining: null,
        ratio: 0,
        exhaustedAt: null,
        nextReleaseAt: null,
        premiumExpiresAt: null
      }
    });
    syncFromCache();
  }

  return {
    session,
    plan,
    planId,
    usage,
    ready,
    isAuthenticated: Boolean(session),
    emailVerified: Boolean(session?.user.emailVerified),
    refresh,
    logout
  };
}
