import { formatCurrency } from '@/lib/formatters';
import { sendSmsAlert } from '@/lib/orcamentos/sms';
import { buildProfissionalWhatsAppNotifyUrl } from '@/lib/orcamentos/whatsapp-links';
import { sendPushToOwner } from '@/lib/push/send';

export interface NotifyOrcamentoInput {
  id: string;
  profissionalNome: string;
  profissionalWhatsapp: string;
  clienteNome: string;
  total: number;
  status: 'approved' | 'declined';
  feedbackCliente?: string | null;
  ownerEmail?: string | null;
  publicUrl: string;
}

export interface NotifyOrcamentoResult {
  emailSent: boolean;
  emailError?: string;
  smsSent: boolean;
  smsConfigured: boolean;
  smsError?: string;
  whatsappUrl: string;
  whatsappApiSent: boolean;
  whatsappApiConfigured: boolean;
  whatsappApiError?: string;
  whatsappProvider?: string | null;
  pushSent: number;
  pushConfigured: boolean;
}

function alertText(input: NotifyOrcamentoInput) {
  const approved = input.status === 'approved';
  return approved
    ? `Resolva Jato: ${input.clienteNome} APROVOU o orçamento de ${formatCurrency(input.total)}.\n\nAbrir: ${input.publicUrl}`
    : `Resolva Jato: ${input.clienteNome} pediu AJUSTE no orçamento (${formatCurrency(input.total)}).\nMotivo: ${input.feedbackCliente || '-'}\n\nAbrir: ${input.publicUrl}`;
}

/**
 * Aviso ao profissional na aprovação do cliente.
 * WhatsApp da API é efêmero (só no envio do profissional → cliente).
 * Aqui usamos e-mail, SMS, push e link wa.me de contingência.
 */
export async function notifyProfissional(input: NotifyOrcamentoInput): Promise<NotifyOrcamentoResult> {
  const whatsappUrl = buildProfissionalWhatsAppNotifyUrl(input);
  const email = input.ownerEmail?.trim().toLowerCase();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || 'Resolva Jato <onboarding@resend.dev>';
  const approved = input.status === 'approved';
  const text = alertText(input);

  let emailSent = false;
  let emailError: string | undefined;

  if (!email) {
    emailError = 'E-mail do profissional não informado.';
  } else if (!apiKey) {
    emailError = 'RESEND_API_KEY não configurada.';
  } else {
    const subject = approved
      ? `Orçamento aprovado por ${input.clienteNome}`
      : `Ajuste solicitado por ${input.clienteNome}`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2 style="margin:0 0 12px">${subject}</h2>
        <p><strong>Cliente:</strong> ${input.clienteNome}</p>
        <p><strong>Total:</strong> ${formatCurrency(input.total)}</p>
        ${
          approved
            ? '<p>O cliente aprovou o orçamento. Você já pode seguir com o atendimento.</p>'
            : `<p><strong>Pedido de ajuste:</strong> ${input.feedbackCliente || '-'}</p>`
        }
        <p><a href="${input.publicUrl}">Abrir orçamento</a></p>
        <p style="color:#64748b;font-size:12px;margin-top:24px">Aviso automático do Resolva Jato</p>
      </div>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: `[Resolva Jato] ${subject}`,
          html
        })
      });

      if (!response.ok) {
        const detail = await response.text();
        emailError = detail.slice(0, 200) || `Resend HTTP ${response.status}`;
      } else {
        emailSent = true;
      }
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Falha ao enviar e-mail.';
    }
  }

  const sms = await sendSmsAlert(input.profissionalWhatsapp, text);

  let pushSent = 0;
  let pushConfigured = false;
  if (email) {
    const push = await sendPushToOwner(email, {
      title: 'Resolva Jato',
      body: approved
        ? `Orçamento APROVADO por ${input.clienteNome} · ${formatCurrency(input.total)}`
        : `Ajuste pedido por ${input.clienteNome} · ${formatCurrency(input.total)}`,
      url: input.publicUrl,
      tag: `orcamento-${input.id}`,
      playSound: true
    });
    pushSent = push.sent;
    pushConfigured = push.configured;
  }

  return {
    emailSent,
    emailError,
    smsSent: sms.sent,
    smsConfigured: sms.configured,
    smsError: sms.error,
    whatsappUrl,
    whatsappApiSent: false,
    whatsappApiConfigured: false,
    whatsappApiError:
      'WhatsApp da API é só no envio do profissional ao cliente (conectar → enviar → desconectar).',
    whatsappProvider: null,
    pushSent,
    pushConfigured
  };
}
