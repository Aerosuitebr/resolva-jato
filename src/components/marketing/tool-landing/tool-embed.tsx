import type { ReactNode } from 'react';

export function ToolLandingEmbed({ toolName, tool }: { toolName: string; tool: ReactNode }) {
  return (
    <section id="ferramenta" className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Experimente agora</p>
        <h2 className="rj-display mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Monte seu {toolName.toLowerCase()} sem precisar sair da página.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Preencha alguns dados abaixo e veja o resultado em tempo real. Depois é só continuar para salvar e baixar.
        </p>
        <div className="mt-10">{tool}</div>
      </div>
    </section>
  );
}
