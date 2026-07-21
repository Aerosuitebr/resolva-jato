import { Quote, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const TESTIMONIALS = [
  {
    name: 'Camila R.',
    role: 'Freelancer de design',
    quote: 'Montei proposta e contrato no mesmo dia. Cliente assinou sem eu abrir o Word.',
    rating: 5
  },
  {
    name: 'Pedro M.',
    role: 'Estudante de administração',
    quote: 'Capa ABNT e currículo prontos em minutos. Salvou minha entrega da faculdade.',
    rating: 5
  },
  {
    name: 'Luciana S.',
    role: 'MEI · serviços',
    quote: 'Orçamento com link + Pix. Cobrei no WhatsApp e fechei na hora.',
    rating: 5
  }
] as const;

export function TestimonialsSection({ className }: { className?: string }) {
  return (
    <section className={cn('border-y border-slate-200 bg-slate-50', className)}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="rj-display text-sm font-bold uppercase tracking-[0.2em] text-sky-700">Quem já usa</p>
        <h2 className="rj-display mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Credibilidade de quem resolve no dia a dia.
        </h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <li
              key={item.name}
              className="relative flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Quote className="h-5 w-5 text-sky-500" aria-hidden />
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-700">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-0.5" aria-label={`${item.rating} de 5 estrelas`}>
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
