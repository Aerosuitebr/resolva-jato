'use client';

import { usePathname } from 'next/navigation';

export function useActiveRoute(href: string) {
  const pathname = usePathname();
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
