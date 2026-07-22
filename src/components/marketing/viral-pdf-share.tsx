'use client';

import { useState } from 'react';
import { MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  buildViralPdfShareWhatsAppUrl,
  viralHomeUrl
} from '@/lib/viral-loop';

export function ViralPdfShareModal({
  open,
  onClose,
  docLabel
}: {
  open: boolean;
  onClose: () => void;
  docLabel: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="PDF pronto — espalhe o link"
      description={`Seu ${docLabel} já baixou. Um toque no WhatsApp ajuda o Resolva Jato a crescer.`}
      size="md"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
            <a
              href={buildViralPdfShareWhatsAppUrl(docLabel)}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
            >
              <MessageCircle className="h-4 w-4" />
              Mandar no WhatsApp
            </a>
          </Button>
        </div>
      }
    >
      <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
        <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <span>
          O PDF leva a marca Resolva Jato no rodapé (e um logo discreto). Quem receber pode criar o
          dele em{' '}
          <a
            className="font-semibold text-sky-700 underline-offset-2 hover:underline"
            href={viralHomeUrl('pdf_modal')}
            target="_blank"
            rel="noreferrer"
          >
            resolvajato.com.br
          </a>
          . Remova a marca por R$ 4,99/mês na sua conta.
        </span>
      </p>
    </Modal>
  );
}

export function useViralPdfShare() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [docLabel, setDocLabel] = useState('documento');

  function afterPdfExport(label = 'documento') {
    setDocLabel(label);
    setOpen(true);
    toast('PDF baixado. Compartilhe e divulgue o Resolva Jato!');
  }

  return {
    afterPdfExport,
    viralShareOpen: open,
    viralShareLabel: docLabel,
    closeViralShare: () => setOpen(false)
  };
}
