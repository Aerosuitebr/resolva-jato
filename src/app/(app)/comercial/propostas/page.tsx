'use client';

import Link from 'next/link';
import { Copy, Edit, Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionIconButton } from '@/components/shared/action-icon-button';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { PageHero } from '@/components/shared/page-hero';
import { SearchFilterBar } from '@/components/shared/search-filter-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { propostas, statusOptions } from '@/lib/mock-data';
import type { Proposta } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PropostasPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('todos');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return propostas.filter((proposta) => {
      const matchesSearch = !query || `${proposta.numero} ${proposta.cliente} ${proposta.produto}`.toLowerCase().includes(query);
      const matchesStatus = status === 'todos' || proposta.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const columns: DataTableColumn<Proposta>[] = [
    {
      key: 'numero',
      header: 'Numero',
      render: (row) => (
        <Link href="#" className="font-bold text-[var(--rj-link)] hover:underline">
          {row.numero}
        </Link>
      )
    },
    { key: 'cliente', header: 'Cliente', render: (row) => <span className="font-medium text-slate-800">{row.cliente}</span> },
    { key: 'produto', header: 'Produto/Servico', render: (row) => <span className="line-clamp-1 max-w-[260px]">{row.produto}</span> },
    { key: 'valor', header: 'Valor', render: (row) => <span className="font-bold text-[var(--rj-success)]">{formatCurrency(row.valor)}</span> },
    { key: 'data', header: 'Data', render: (row) => formatDate(row.data) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'os',
      header: 'OS',
      render: (row) =>
        row.osNumero ? (
          <Link href="/oficina/ordens-servico" className="font-semibold text-[var(--rj-link)] hover:underline">
            {row.osNumero}
          </Link>
        ) : (
          <span className="text-slate-400">-</span>
        )
    },
    {
      key: 'acoes',
      header: 'Acoes',
      className: 'text-right',
      render: () => (
        <div className="flex justify-end gap-1">
          <ActionIconButton icon={Edit} label="Editar" />
          <ActionIconButton icon={Eye} label="Visualizar" />
          <ActionIconButton icon={Copy} label="Duplicar" />
          <ActionIconButton icon={Trash2} label="Excluir" variant="danger" />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <PageHero
        title="Propostas Comerciais"
        subtitle="Gerencie propostas, acompanhe status e converta em ordens de servico"
        icon={FileText}
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Button>
        }
      />
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={status}
        onStatusChange={setStatus}
        statusOptions={statusOptions}
        placeholder="Buscar por numero, cliente ou produto..."
        metadata="PTAX USD: R$ 5,42 - atualizado em 14/07/2026"
      />
      <DataTable columns={columns} data={filtered} totalRecords={30} page={1} pageSize={10} />
    </div>
  );
}
