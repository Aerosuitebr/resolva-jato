'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home, Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SidebarUserCard } from './sidebar-user-card';
import { SidebarModuleSearch } from './sidebar-module-search';
import { SidebarNav } from './sidebar-nav';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileOpen, onMobileClose, search, onSearchChange }: SidebarProps) {
  return (
    <>
      <Button type="button" size="icon" className="fixed left-4 top-11 z-[150] lg:hidden" onClick={onMobileOpen} aria-label="Abrir menu">
        <Menu className="h-5 w-5" />
      </Button>
      {mobileOpen ? <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-[90] bg-slate-950/60 lg:hidden" onClick={onMobileClose} /> : null}
      <aside
        className={cn(
          'fixed bottom-0 left-0 top-8 z-[100] flex h-[calc(100vh-2rem)] flex-col overflow-hidden border-r border-sky-300/20 bg-[image:var(--rj-sidebar-bg)] text-[var(--rj-sidebar-text)] shadow-[4px_0_48px_rgba(0,0,0,0.45)] transition-all duration-300',
          collapsed ? 'w-[var(--rj-sidebar-collapsed)]' : 'w-[var(--rj-sidebar-width)]',
          'max-lg:w-[min(88vw,300px)] max-lg:-translate-x-full',
          mobileOpen && 'max-lg:translate-x-0'
        )}
      >
        <div className="pointer-events-none absolute inset-0 rj-hud-grid opacity-80" />
        <div className="pointer-events-none absolute bottom-[8%] left-[-20%] right-[-20%] h-[42%] animate-[rj-horizon-pulse_8s_ease-in-out_infinite_alternate] bg-[radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(14,165,233,0.35)_0%,transparent_70%)]" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <header className="flex items-center gap-2 px-3 py-4">
            <Link href="/" className="min-w-0 flex-1 rounded-2xl p-1 transition-colors hover:bg-white/5">
              <Logo collapsed={collapsed} />
            </Link>
            <Tooltip label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
              <Button type="button" variant="ghost" size="icon" onClick={onToggleCollapse} className="hidden text-slate-300 hover:bg-sky-400/20 hover:text-white lg:inline-flex">
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </Tooltip>
            <Button type="button" variant="ghost" size="icon" onClick={onMobileClose} className="text-slate-300 hover:bg-white/10 lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </header>
          <Link href="/ferramentas" className={cn('mx-3 mb-3 flex items-center gap-3 rounded-2xl border border-sky-300/30 bg-sky-500/15 px-3 py-3 text-white shadow-[0_12px_32px_rgba(14,165,233,0.18)]', collapsed && 'justify-center px-2')}>
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-sky-300/30 bg-sky-500/20 text-sky-200">
              <Home className="h-4 w-4" />
            </span>
            {!collapsed ? (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">Ferramentas</span>
                <span className="block truncate text-xs text-slate-400">Currículos, recibos e mais</span>
              </span>
            ) : null}
          </Link>
          <SidebarUserCard collapsed={collapsed} />
          {!collapsed ? <SidebarModuleSearch value={search} onChange={onSearchChange} /> : null}
          <SidebarNav collapsed={collapsed} search={search} />
          {!collapsed ? <div className="border-t border-white/10 px-4 py-3 text-xs font-semibold text-slate-500">v0.1.0</div> : null}
        </div>
      </aside>
    </>
  );
}
