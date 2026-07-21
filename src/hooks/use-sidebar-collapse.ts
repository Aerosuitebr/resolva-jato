'use client';

import { useEffect, useState } from 'react';

export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('rj-sidebar-collapsed');
    setCollapsed(stored === 'true');
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('rj-sidebar-collapsed', String(next));
      return next;
    });
  }

  return { collapsed, toggleCollapsed };
}
