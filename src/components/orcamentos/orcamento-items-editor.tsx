'use client';

import { Copy, Package, Plus, Trash2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { formatCurrency, formatCurrencyInput, parseCurrency } from '@/lib/formatters';
import { createEmptyItem } from '@/lib/orcamentos/defaults';
import type { OrcamentoItem } from '@/lib/orcamentos/types';
import { cn } from '@/lib/utils';

interface OrcamentoItemsEditorProps {
  items: OrcamentoItem[];
  onChange: (items: OrcamentoItem[]) => void;
  error?: string;
}

function itemLooksLikeService(name: string) {
  return /servi[cç]o|instala|manuten|consult|hora|visita|m[aã]o de obra/i.test(name);
}

export function OrcamentoItemsEditor({ items, onChange, error }: OrcamentoItemsEditorProps) {
  function updateItem(id: string, patch: Partial<OrcamentoItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.id !== id));
  }

  function duplicateItem(id: string) {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;
    const source = items[index];
    const copy: OrcamentoItem = {
      ...source,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item_${Date.now()}`
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOnlyItem = items.length <= 1;
        const zeroValue = Boolean(item.nome.trim() && item.valorUnitario <= 0);
        const Icon = itemLooksLikeService(item.nome) ? Wrench : Package;
        return (
          <div
            key={item.id}
            className={cn(
              'rounded-2xl border bg-slate-50/70 p-4',
              zeroValue ? 'border-rose-300' : 'border-slate-200'
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-xl',
                    itemLooksLikeService(item.nome)
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-amber-100 text-amber-800'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">Item {index + 1}</p>
                  <p className="text-[11px] font-medium text-slate-600">
                    {itemLooksLikeService(item.nome) ? 'Serviço' : 'Produto / serviço'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateItem(item.id)}
                  aria-label="Duplicar item"
                  title="Duplicar item"
                >
                  <Copy className="h-4 w-4 text-slate-500" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={isOnlyItem}
                  aria-label="Remover item"
                  title={isOnlyItem ? 'Mantenha ao menos um item no orçamento' : 'Remover item'}
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </div>
            <FormField label="Serviço / produto" htmlFor={index === 0 ? 'orc-item-0-nome' : undefined}>
              <Input
                id={index === 0 ? 'orc-item-0-nome' : undefined}
                value={item.nome}
                onChange={(event) => updateItem(item.id, { nome: event.target.value })}
                placeholder="Ex.: Instalação de ar-condicionado"
              />
            </FormField>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <FormField label="Qtd.">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={item.quantidade}
                  onChange={(event) =>
                    updateItem(item.id, { quantidade: Math.max(1, Number(event.target.value) || 1) })
                  }
                />
              </FormField>
              <FormField
                label="Valor unitário"
                error={zeroValue ? 'Valor deve ser maior que zero.' : undefined}
              >
                <MaskedInput
                  format={formatCurrencyInput}
                  value={
                    item.valorUnitario > 0
                      ? formatCurrencyInput(String(Math.round(item.valorUnitario * 100)))
                      : ''
                  }
                  onValueChange={(value) => updateItem(item.id, { valorUnitario: parseCurrency(value) })}
                  placeholder="R$ 0,00"
                  invalid={zeroValue}
                  valid={item.valorUnitario > 0}
                />
              </FormField>
              <FormField label="Subtotal">
                <Input
                  readOnly
                  className="bg-white font-semibold"
                  value={formatCurrency(item.quantidade * item.valorUnitario)}
                />
              </FormField>
            </div>
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={() => onChange([...items, createEmptyItem()])}>
        <Plus className="h-4 w-4" />
        Adicionar item
      </Button>
      {error ? <p className="text-xs font-semibold leading-4 text-rose-600">{error}</p> : null}
    </div>
  );
}
