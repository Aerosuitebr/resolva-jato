import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function Badge({ className, ...props }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold', className)} {...props} />;
}
