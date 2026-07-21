'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DocumentHistoryItem {
  id: string;
  title: string;
  /** Tipo do documento (procuração, contrato, etc.). */
  typeLabel: string;
  /** Nome do cliente, empresa ou parte principal. */
  partyLabel: string;
  updatedAt: string;
}

interface DocumentHistoryPanelProps {
  items: DocumentHistoryItem[];
  activeId: string | null;
  /** Abre o mesmo documento salvo para edição. */
  onEdit: (id: string) => void;
  /** Cria um documento novo com as mesmas informações. */
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  emptyLabel?: string;
}

function formatUpdatedAt(value: string) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(time));
}

export function DocumentHistoryPanel({
  items,
  activeId,
  onEdit,
  onDuplicate,
  onDelete,
  emptyLabel = 'Nenhum documento salvo ainda.'
}: DocumentHistoryPanelProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 p-5 sm:p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Histórico</h2>
        <p className="mt-3 text-sm text-slate-600">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Histórico</h2>
        <p className="text-xs font-semibold text-slate-500">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </p>
      </div>

      <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li
              key={item.id}
              className={cn(
                'flex flex-col gap-3 bg-white p-4 transition sm:flex-row sm:items-center sm:justify-between',
                active && 'bg-sky-50/80'
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-900">{item.title || 'Sem título'}</p>
                  {active ? (
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold normal-case tracking-normal text-sky-800">
                      Em edição
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs font-medium text-sky-800">{item.typeLabel}</p>
                <p className="mt-1 truncate text-sm text-slate-700">
                  {item.partyLabel || 'Cliente / empresa não informado'}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Atualizado em {formatUpdatedAt(item.updatedAt)}</p>
              </div>

              <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant={active ? 'outline' : 'default'}
                  onClick={() => onEdit(item.id)}
                  disabled={active}
                  title={active ? 'Documento em edição' : 'Abrir o mesmo documento'}
                  className="justify-center"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sm:inline">{active ? 'Editando' : 'Editar'}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onDuplicate(item.id)}
                  title="Criar cópia com os mesmos dados"
                  className="justify-center"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Duplicar</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(item.id)}
                  disabled={items.length <= 1}
                  title={items.length <= 1 ? 'Mantenha ao menos um documento' : 'Excluir'}
                  className="justify-center border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir</span>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
