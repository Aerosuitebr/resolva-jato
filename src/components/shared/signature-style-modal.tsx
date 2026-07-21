'use client';

import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { DigitalSignatureDisplay } from '@/components/shared/digital-signature-display';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { SIGNATURE_TEMPLATES } from '@/lib/signatures/templates';
import type { DigitalSignature, SignatureStyleId } from '@/lib/signatures/types';
import { cn } from '@/lib/utils';

interface SignatureStyleModalProps {
  open: boolean;
  onClose: () => void;
  value: DigitalSignature;
  defaultName?: string;
  onApply: (signature: DigitalSignature) => void;
}

export function SignatureStyleModal({ open, onClose, value, defaultName = '', onApply }: SignatureStyleModalProps) {
  const [draft, setDraft] = useState<DigitalSignature>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  function selectStyle(styleId: SignatureStyleId) {
    setDraft((current) => ({ ...current, styleId, enabled: true }));
  }

  function handleApply() {
    onApply({
      ...draft,
      enabled: true,
      text: draft.text.trim() || defaultName
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assinatura digital"
      description="Escolha um estilo recomendado e personalize o texto que aparecerá no documento e no PDF."
    >
      <div className="space-y-5">
        <FormField label="Texto da assinatura" hint="Use seu nome completo ou o nome da empresa.">
          <Input
            value={draft.text}
            onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))}
            placeholder={defaultName || 'Seu nome completo'}
          />
        </FormField>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <p className="text-sm font-semibold text-slate-800">Templates recomendados</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SIGNATURE_TEMPLATES.map((template) => {
              const active = draft.styleId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => selectStyle(template.id)}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all',
                    active ? 'border-sky-600 bg-sky-50 shadow-sm ring-2 ring-sky-100' : 'border-slate-200 bg-slate-50 hover:border-sky-300'
                  )}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{template.name}</p>
                      {template.recommended ? (
                        <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                          Recomendado
                        </span>
                      ) : null}
                    </div>
                    {active ? <Check className="h-5 w-5 text-sky-600" /> : null}
                  </div>
                  <div className="rounded-xl border border-white bg-white px-4 py-5 text-center shadow-sm">
                    <p className={cn('text-slate-900', template.className, template.previewClassName)}>
                      {draft.text.trim() || defaultName || 'Sua assinatura'}
                    </p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={draft.showLine}
            onChange={(event) => setDraft((current) => ({ ...current, showLine: event.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
          />
          Exibir linha abaixo da assinatura
        </label>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Prévia final</p>
          <DigitalSignatureDisplay
            signature={{ ...draft, text: draft.text.trim() || defaultName }}
            subtitle={defaultName ? `Assinatura de ${defaultName}` : undefined}
            size="lg"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>Aplicar assinatura</Button>
        </div>
      </div>
    </Modal>
  );
}
