import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Privacidade | Resolva Jato',
  description: 'Como o Resolva Jato trata dados pessoais e cookies.'
};

export default function PrivacidadePage() {
  return (
    <LegalPage title="Privacidade" subtitle="Transparência sobre dados no Resolva Jato">
      <p>
        O Resolva Jato (<strong>resolvajato.com.br</strong>) é operado pela Aerosuite. Coletamos apenas
        os dados necessários para criar e proteger sua conta: nome, e-mail, senha (armazenada com hash),
        e sinais de segurança (IP, dispositivo e logs de auditoria) para prevenir abuso.
      </p>
      <p>
        Não vendemos seus dados. Conteúdos que você gera nas ferramentas ficam associados à sua conta
        para uso do serviço. Você pode solicitar exclusão da conta pelo e-mail de contato.
      </p>
      <p>
        Usamos cookies essenciais de sessão e de dispositivo (`rj_session`, `rj_device`) e Cloudflare
        Turnstile para proteção contra bots. Não usamos pixels de anúncio de terceiros neste site.
      </p>
      <p>Última atualização: 21 de julho de 2026.</p>
    </LegalPage>
  );
}
