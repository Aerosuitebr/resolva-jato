import Image from 'next/image';
import rjEscuro from '@/assets/RJ_escuro.png';
import { cn } from '@/lib/utils';
import { viralPdfFooterLabel } from '@/lib/viral-loop';

/** Marca d’água central com o logo Resolva Jato — destaque moderado. */
export function DocumentBrandWatermark({ className }: { className?: string }) {
  return (
    <div
      data-rj-brand="watermark"
      className={cn('pointer-events-none absolute inset-0 z-[1] overflow-hidden', className)}
      aria-hidden
    >
      <div className="absolute left-1/2 top-1/2 w-[50%] max-w-[320px] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] opacity-[0.16]">
        <Image src={rjEscuro} alt="" className="h-auto w-full object-contain" priority={false} />
      </div>
    </div>
  );
}

/**
 * Rodapé viral — posição da antiga linha de aviso (área imprimível).
 * Alinhado ao carimbo do PDF em `exportElementToPdf`.
 */
export function DocumentViralFooter({ className }: { className?: string }) {
  return (
    <div data-rj-brand="footer" className={cn('relative z-[2] mt-auto pb-[18mm] pt-8 text-center', className)}>
      <p className="mx-auto max-w-[88%] text-[10px] leading-5 text-slate-400">{viralPdfFooterLabel()}</p>
    </div>
  );
}
