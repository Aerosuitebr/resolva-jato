'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { normalizeReferralCode, REFERRAL_STORAGE_KEY } from '@/lib/referral-shared';

/** Captura ?ref= na URL e guarda para o cadastro. */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromQuery = normalizeReferralCode(searchParams.get('ref'));
    if (!fromQuery || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(REFERRAL_STORAGE_KEY, fromQuery);
    } catch {
      // ignore quota / private mode
    }
  }, [searchParams]);

  return null;
}

export function readStoredReferralCode() {
  if (typeof window === 'undefined') return '';
  try {
    return normalizeReferralCode(window.localStorage.getItem(REFERRAL_STORAGE_KEY));
  } catch {
    return '';
  }
}

export function clearStoredReferralCode() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
