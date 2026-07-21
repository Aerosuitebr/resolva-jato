'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SidebarModuleSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SidebarModuleSearch({ value, onChange }: SidebarModuleSearchProps) {
  return (
    <label className="relative block px-3 pb-3">
      <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar modulo..."
        className="border-white/10 bg-slate-950/55 pl-10 pr-9 text-slate-100 placeholder:text-slate-500"
      />
      {value ? (
        <Button type="button" variant="ghost" size="icon" onClick={() => onChange('')} className="absolute right-4 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-400">
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </label>
  );
}
