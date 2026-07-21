import * as React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger' | 'secondary' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      loading = false,
      icon: Icon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'rj-press inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
      variant === 'default' &&
        'bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:shadow-md active:bg-sky-800',
      variant === 'success' &&
        'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md active:bg-emerald-800 focus-visible:ring-emerald-400',
      variant === 'secondary' &&
        'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950',
      variant === 'outline' &&
        'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100',
      variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200/80',
      variant === 'danger' &&
        'bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200/80 focus-visible:ring-rose-300',
      size === 'default' && 'min-h-11 h-11 px-4 text-sm',
      size === 'sm' && 'min-h-10 h-10 px-3 text-xs',
      size === 'lg' && 'min-h-12 h-12 px-6 text-base',
      size === 'icon' && 'h-11 w-11 min-h-11 p-0',
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className)
      });
    }

    return (
      <button type="button" ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : Icon ? (
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
        ) : null}
        {children}
        {loading ? <span className="sr-only">Carregando</span> : null}
      </button>
    );
  }
);
Button.displayName = 'Button';
