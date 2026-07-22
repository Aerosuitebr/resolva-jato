import { LogoIcon } from '@/components/brand/logo-icon';
import { cn } from '@/lib/utils';
import { viralPdfFooterLabel } from '@/lib/viral-loop';

/** Logo discreto no canto superior — visível no preview; oculto no capture do PDF. */
export function DocumentBrandHeader({ className }: { className?: string }) {
  return (
    <div
      data-rj-brand="header"
      className={cn('pointer-events-none absolute right-3 top-3 z-10 opacity-[0.18]', className)}
      aria-hidden
    >
      <LogoIcon className="h-9 w-9" />
    </div>
  );
}

/** Rodapé visível no preview (e alinhado ao carimbo do PDF). */
export function DocumentViralFooter({
  className,
  disclaimer
}: {
  className?: string;
  disclaimer?: string;
}) {
  return (
    <div data-rj-brand="footer" className={cn('mt-auto pt-8 text-center', className)}>
      {disclaimer ? (
        <p className="text-[10px] leading-5 text-slate-400">{disclaimer}</p>
      ) : null}
      <p className={cn('mx-auto max-w-[90%] text-[9px] font-semibold leading-4 text-slate-500', disclaimer && 'mt-2')}>
        {viralPdfFooterLabel()}
      </p>
    </div>
  );
}
