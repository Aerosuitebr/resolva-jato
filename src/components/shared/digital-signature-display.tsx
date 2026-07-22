import { getSignatureTemplate } from '@/lib/signatures/templates';
import type { DigitalSignature } from '@/lib/signatures/types';
import { cn } from '@/lib/utils';

interface DigitalSignatureDisplayProps {
  signature: DigitalSignature;
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl'
};

export function DigitalSignatureDisplay({
  signature,
  subtitle,
  className,
  size = 'md'
}: DigitalSignatureDisplayProps) {
  if (!signature.enabled) {
    return (
      <div className={cn('text-center', className)}>
        {signature.showLine ? <div className="mx-auto mb-2 h-px w-56 bg-slate-400" /> : null}
        <p className="text-sm font-semibold text-slate-900">
          {signature.text.trim() || 'Assinatura do recebedor'}
        </p>
        {subtitle ? (
          <p className="mt-2 text-xs text-slate-500" style={{ fontFamily: 'inherit' }}>
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  }

  const template = getSignatureTemplate(signature.styleId);
  // Nunca usar subtitle (cidade/data) como traço da assinatura — isso travava a fonte do documento
  const label = signature.text.trim() || 'Assinatura';

  return (
    <div className={cn('text-center', className)}>
      <p className={cn('leading-none text-slate-900', template.className, sizeMap[size])}>{label}</p>
      {signature.showLine ? <div className="mx-auto mt-3 h-px w-56 bg-slate-400" /> : null}
      {subtitle ? (
        <p className="mt-2 text-xs text-slate-500" style={{ fontFamily: 'inherit' }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
