import { ArrowDownRight, ArrowUpRight, CircleDollarSign, FileText, PackageSearch, Wrench } from 'lucide-react';
import type { KpiData } from '@/lib/types';

interface KpiCardProps {
  item: KpiData;
}

const iconMap = {
  Wrench,
  FileText,
  PackageSearch,
  CircleDollarSign
};

export function KpiCard({ item }: KpiCardProps) {
  const Icon = iconMap[item.icon as keyof typeof iconMap] ?? FileText;
  const TrendIcon = item.trend?.positive ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-rj">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{item.label}</p>
          <strong className="mt-2 block text-2xl font-bold text-slate-950">{item.value}</strong>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {item.trend ? (
        <span className={`mt-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${item.trend.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {item.trend.value}
        </span>
      ) : null}
    </article>
  );
}
