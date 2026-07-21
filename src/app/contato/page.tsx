import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Contato | Resolva Jato',
  description: 'Fale com a equipe do Resolva Jato.'
};

export default function ContatoPage() {
  return (
    <LegalPage title="Contato" subtitle="Estamos em resolvajato.com.br">
      <p>
        O Resolva Jato é um produto da <strong>Aerosuite</strong>. Para suporte, segurança ou
        privacidade, escreva para:
      </p>
      <p>
        <a
          href="mailto:contato@aerosuite.com.br"
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          contato@aerosuite.com.br
        </a>
      </p>
      <p>
        Site oficial:{' '}
        <Link href="/" className="font-semibold text-sky-700 hover:text-sky-800">
          https://resolvajato.com.br
        </Link>
      </p>
      <p>
        Relatos de segurança: veja também{' '}
        <a
          href="/.well-known/security.txt"
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          security.txt
        </a>
        .
      </p>
    </LegalPage>
  );
}
