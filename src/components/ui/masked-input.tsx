import * as React from 'react';
import { cn } from '@/lib/utils';

export interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Recebe o valor bruto digitado e retorna a versão mascarada exibida. */
  format: (value: string) => string;
  /** Recebe o valor já mascarado a cada alteração. */
  onValueChange: (masked: string) => void;
  invalid?: boolean;
  valid?: boolean;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, format, onValueChange, value, invalid, valid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        value={value}
        inputMode="numeric"
        aria-invalid={invalid || undefined}
        onChange={(event) => onValueChange(format(event.target.value))}
        className={cn(
          'flex h-11 min-h-11 w-full rounded-xl border bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-sm',
          'outline-none transition-all duration-150 placeholder:font-normal placeholder:text-slate-400',
          'hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
          invalid && 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-100',
          valid && !invalid && 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100',
          !invalid && !valid && 'border-slate-200',
          className
        )}
        {...props}
      />
    );
  }
);
MaskedInput.displayName = 'MaskedInput';
