import type { ReactNode } from 'react';
import { DocumentBrandHeader, DocumentViralFooter } from '@/components/brand/document-viral-footer';
import { cn } from '@/lib/utils';

/** Envolve o preview exportável: marca no grátis, limpo no Premium. */
export function DocumentExportShell({
  branded,
  children,
  disclaimer,
  className
}: {
  branded: boolean;
  children: ReactNode;
  disclaimer?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      {branded ? <DocumentBrandHeader /> : null}
      {children}
      {branded ? <DocumentViralFooter disclaimer={disclaimer} /> : null}
    </div>
  );
}
