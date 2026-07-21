'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { menuSections } from '@/lib/menu-config';
import type { MenuSection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useActiveRoute } from '@/hooks/use-active-route';
import { Tooltip } from '@/components/ui/tooltip';

interface SidebarNavProps {
  collapsed: boolean;
  search: string;
}

function NavItemLink({ item, collapsed }: { item: MenuSection['items'][number]; collapsed: boolean }) {
  const active = useActiveRoute(item.href);
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      className={cn(
        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
        active && 'bg-white/10 text-white',
        collapsed && 'justify-center px-2'
      )}
    >
      <span className={cn('absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--rj-sidebar-active-bar)] opacity-0', active && 'opacity-100')} />
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-slate-950/55">
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
  return collapsed ? <Tooltip label={item.label}>{link}</Tooltip> : link;
}

function SectionItems({ section, collapsed }: { section: MenuSection; collapsed: boolean }) {
  return (
    <ul className={cn('grid gap-1 px-2 pb-2', collapsed && 'px-1')}>
      {section.items.map((item) => (
        <li key={item.id}>
          <NavItemLink item={item} collapsed={collapsed} />
        </li>
      ))}
    </ul>
  );
}

export function SidebarNav({ collapsed, search }: SidebarNavProps) {
  const [openSections, setOpenSections] = useState(() => new Set(menuSections.map((section) => section.id)));
  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return menuSections;
    return menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => `${item.label} ${section.title}`.toLowerCase().includes(query))
      }))
      .filter((section) => section.items.length > 0);
  }, [search]);

  function toggleSection(id: string) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
      {filteredSections.map((section) => {
        const Icon = section.icon;
        const isOpen = collapsed || search || openSections.has(section.id);
        return (
          <section key={section.id} className={cn('mb-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35', collapsed && 'border-transparent bg-transparent')}>
            {collapsed ? (
              <Tooltip label={section.title}>
                <button type="button" className="mx-auto mb-1 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-slate-950/55" style={{ color: section.accentColor }}>
                  <Icon className="h-5 w-5" />
                </button>
              </Tooltip>
            ) : (
              <button type="button" onClick={() => toggleSection(section.id)} className="flex w-full items-center gap-3 px-3 py-3 text-left">
                <span className="grid h-9 w-9 place-items-center rounded-xl border" style={{ color: section.accentColor, borderColor: `${section.accentColor}55`, backgroundColor: `${section.accentColor}1f` }}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-slate-100">{section.title}</span>
                  <span className="text-[0.68rem] text-slate-500">{section.items.length} itens</span>
                </span>
                <ChevronDown className={cn('h-4 w-4 text-slate-500 transition-transform', !isOpen && '-rotate-90')} />
              </button>
            )}
            {isOpen ? <SectionItems section={section} collapsed={collapsed} /> : null}
          </section>
        );
      })}
    </nav>
  );
}
