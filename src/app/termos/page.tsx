import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Termos de uso | Resolva Jato',
  description: 'Condições de uso da plataforma Resolva Jato.'
};

export default function TermosPage() {
  return (
    <LegalPage title="Termos de uso" subtitle="Regras claras para uso do Resolva Jato">
      <p>
        Ao criar uma conta em <strong>resolvajato.com.br</strong>, você concorda em usar a plataforma de
        boa-fé: sem spam, fraude, engenharia social ou tentativas de contornar limites de segurança.
      </p>
      <p>
        As ferramentas gratuitas têm cotas. Documentos gerados são de sua responsabilidade jurídica e
        profissional — o Resolva Jato oferece modelos e produtividade, não aconselhamento legal.
      </p>
      <p>
        Podemos suspender contas que violem estes termos ou coloquem outros usuários em risco. O
        serviço pode evoluir; avisaremos mudanças relevantes quando possível.
      </p>
      <p>Última atualização: 21 de julho de 2026.</p>
    </LegalPage>
  );
}
