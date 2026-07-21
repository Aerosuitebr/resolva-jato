import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Sobre | Resolva Jato',
  description: 'O que é o Resolva Jato e quem opera a plataforma.'
};

export default function SobrePage() {
  return (
    <LegalPage title="Sobre o Resolva Jato" subtitle="Ferramentas práticas, sem burocracia">
      <p>
        O <strong>Resolva Jato</strong> (resolvajato.com.br) reúne ferramentas para autônomos,
        estudantes e pequenos negócios: currículos, recibos, contratos, propostas e mais — com uso
        gratuito e confirmação de e-mail.
      </p>
      <p>
        A plataforma é desenvolvida e operada pela <strong>Aerosuite</strong>. Não pedimos cartão
        para começar.
      </p>
      <p>
        <Link href="/contato" className="font-semibold text-sky-700 hover:text-sky-800">
          Fale conosco
        </Link>
        {' · '}
        <Link href="/privacidade" className="font-semibold text-sky-700 hover:text-sky-800">
          Privacidade
        </Link>
        {' · '}
        <Link href="/termos" className="font-semibold text-sky-700 hover:text-sky-800">
          Termos
        </Link>
      </p>
    </LegalPage>
  );
}
