'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { StatusOption } from '@/lib/types';

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions: StatusOption[];
  metadata?: string;
  placeholder?: string;
}

export function SearchFilterBar({ searchValue, onSearchChange, statusFilter, onStatusChange, statusOptions, metadata, placeholder = 'Buscar...' }: SearchFilterBarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-rj">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder={placeholder} className="pl-10" />
        </label>
        <Select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)} className="md:w-56">
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      {metadata ? <p className="mt-3 text-xs font-medium text-slate-500">{metadata}</p> : null}
    </section>
  );
}
