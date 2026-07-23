'use client';

interface TopEnvBannerProps {
  visible?: boolean;
}

/** Faixa curta: documentos e busca gratuitos — sem plano, preço ou contagem. */
export function TopEnvBanner({ visible = true }: TopEnvBannerProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[200] h-8 overflow-hidden bg-slate-900">
      <div className="relative z-10 flex h-full items-center justify-center px-4 text-center text-[0.7rem] font-semibold tracking-wide text-sky-100 sm:text-[0.72rem]">
        Documentos profissionais grátis · busca gratuita
      </div>
    </div>
  );
}
