import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex min-h-28 w-full rounded-xl border bg-white px-3.5 py-3 text-sm font-medium text-slate-900 shadow-sm',
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
Textarea.displayName = 'Textarea';
