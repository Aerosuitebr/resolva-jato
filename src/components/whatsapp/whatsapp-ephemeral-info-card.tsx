'use client';

import { MessageCircle, QrCode, Unplug } from 'lucide-react';

/** Explica o modelo multi-usuário: QR na hora do envio, depois desconecta. */
export function WhatsAppEphemeralInfoCard() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
        WhatsApp (vários profissionais)
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Não há um chip fixo no servidor. Cada um conecta o próprio WhatsApp só na hora de enviar o
        orçamento ao cliente.
      </p>
      <ol className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        <li className="flex gap-2">
          <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <span>
            Na ferramenta de orçamentos, ao enviar: escaneie o QR com <strong>o seu</strong> WhatsApp.
          </span>
        </li>
        <li className="flex gap-2">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <span>A mensagem sai do seu número para o cliente.</span>
        </li>
        <li className="flex gap-2">
          <Unplug className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <span>Logo após o envio, o servidor desconecta, pronto para o próximo usuário.</span>
        </li>
      </ol>
      <p className="mt-4 text-xs text-slate-500">
        Quando o cliente aprova, você é avisado por e-mail, SMS e/ou push, sem precisar deixar o
        WhatsApp ligado no servidor.
      </p>
    </div>
  );
}
