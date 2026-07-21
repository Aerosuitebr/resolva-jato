export function ToolLandingArticle({ title, html }: { title: string; html: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="rj-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <div
        className={[
          'mt-6 space-y-4 text-[15px] leading-7 text-slate-700',
          '[&_h3]:rj-display [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-slate-900',
          '[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5',
          '[&_li]:text-slate-700',
          '[&_strong]:font-bold [&_strong]:text-slate-900',
          '[&_a]:font-semibold [&_a]:text-sky-700 [&_a]:underline'
        ].join(' ')}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
