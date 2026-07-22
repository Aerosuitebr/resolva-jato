import type { ReactNode } from 'react';
import {
  DocumentBrandHeader,
  DocumentBrandWatermark,
  DocumentViralFooter
} from '@/components/brand/document-viral-footer';
import { cn } from '@/lib/utils';

/** Envolve o preview exportável: marca no grátis, limpo no Premium. */
export function DocumentExportShell({
  branded,
  children,
  className
}: {
  branded: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative flex min-h-full flex-col', className)}>
      {branded ? <DocumentBrandWatermark /> : null}
      {branded ? <DocumentBrandHeader /> : null}
      <div className="relative z-[2] flex-1">{children}</div>
      {branded ? <DocumentViralFooter /> : null}
    </div>
  );
}
