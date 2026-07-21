import {
  Calendar,
  Gift,
  Infinity as InfinityIcon,
  Layout,
  Search,
  Sparkles,
  TestTube2,
  UserRound,
  Wrench,
  Zap,
  type LucideIcon
} from 'lucide-react';
import type { PlanBenefit, PlanBenefitIcon } from '@/lib/plans';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<PlanBenefitIcon, LucideIcon> = {
  search: Search,
  user: UserRound,
  gift: Gift,
  tools: Wrench,
  test: TestTube2,
  infinity: InfinityIcon,
  zap: Zap,
  sparkles: Sparkles,
  calendar: Calendar,
  layout: Layout
};

export function PlanBenefitsList({
  benefits,
  limit,
  className,
  itemClassName,
  iconWrapClassName = 'bg-sky-400/15 text-sky-300',
  titleClassName = 'text-white',
  textClassName = 'text-slate-400',
  layout = 'row'
}: {
  benefits: PlanBenefit[];
  limit?: number;
  className?: string;
  itemClassName?: string;
  iconWrapClassName?: string;
  titleClassName?: string;
  textClassName?: string;
  layout?: 'row' | 'stack';
}) {
  const items = typeof limit === 'number' ? benefits.slice(0, limit) : benefits;
  const stacked = layout === 'stack';

  return (
    <ul className={cn('grid gap-3', className)}>
      {items.map((benefit) => {
        const Icon = ICON_MAP[benefit.icon];
        return (
          <li
            key={benefit.title}
            className={cn(
              'rounded-2xl border border-white/10 bg-white/5 p-3.5',
              stacked ? 'flex flex-col' : 'flex items-start gap-3',
              itemClassName
            )}
          >
            <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', iconWrapClassName)}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className={cn('min-w-0', stacked && 'mt-3')}>
              <span className={cn('block text-sm font-bold leading-5', titleClassName)}>{benefit.title}</span>
              <span className={cn('mt-0.5 block text-xs leading-5', textClassName)}>{benefit.text}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
