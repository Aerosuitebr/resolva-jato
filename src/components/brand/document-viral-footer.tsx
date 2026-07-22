import { cn } from '@/lib/utils';
import { VIRAL_SITE_HOST, viralPdfFooterLabel } from '@/lib/viral-loop';

/** Rodapé visível no preview (e no PDF rasterizado via html2canvas). */
export function DocumentViralFooter({
  className,
  disclaimer
}: {
  className?: string;
  /** Texto jurídico/contábil opcional acima da linha viral. */
  disclaimer?: string;
}) {
  return (
    <div className={cn('mt-auto pt-8 text-center', className)}>
      {disclaimer ? (
        <p className="text-[10px] leading-5 text-slate-400">{disclaimer}</p>
      ) : null}
      <p className={cn('text-[10px] font-semibold leading-5 text-slate-500', disclaimer && 'mt-2')}>
        {viralPdfFooterLabel()}
      </p>
      <p className="text-[9px] leading-4 text-slate-400">
        Faça o seu grátis em {VIRAL_SITE_HOST}
      </p>
    </div>
  );
}
