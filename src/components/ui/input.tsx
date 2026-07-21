import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-11 min-h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-sm',
        'outline-none transition-all duration-150 placeholder:font-normal placeholder:text-slate-400',
        'hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
        invalid
          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
          : 'border-slate-200',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
