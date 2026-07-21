'use client';

import { Copy, Edit, Eye, Plus, Trash2, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ActionIconButton } from '@/components/shared/action-icon-button';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { PageHero } from '@/components/shared/page-hero';
import { SearchFilterBar } from '@/components/shared/search-filter-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { ordensServico, statusOptions } from '@/lib/mock-data';
import type { OrdemServico } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function OrdensServicoPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('todos');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ordensServico.filter((ordem) => {
      const matchesSearch = !query || `${ordem.numero} ${ordem.cliente} ${ordem.aeronave}`.toLowerCase().includes(query);
      const matchesStatus = status === 'todos' || ordem.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const columns: DataTableColumn<OrdemServico>[] = [
    { key: 'numero', header: 'Numero', render: (row) => <span className="font-bold text-[var(--rj-link)]">{row.numero}</span> },
    { key: 'cliente', header: 'Cliente', render: (row) => <span className="font-medium text-slate-800">{row.cliente}</span> },
    { key: 'aeronave', header: 'Aeronave', render: (row) => row.aeronave },
    { key: 'tipo', header: 'Tipo', render: (row) => row.tipo },
    { key: 'entrada', header: 'Entrada', render: (row) => formatDate(row.dataEntrada) },
    { key: 'previsao', header: 'Previsao', render: (row) => formatDate(row.previsao) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
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
        title="Ordens de Servico"
        subtitle="Acompanhe execucao, capacidade e previsoes da oficina"
        icon={Wrench}
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Nova OS
          </Button>
        }
      />
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={status}
        onStatusChange={setStatus}
        statusOptions={statusOptions}
        placeholder="Buscar por numero, cliente ou aeronave..."
      />
      <DataTable columns={columns} data={filtered} totalRecords={24} page={1} pageSize={8} />
    </div>
  );
}
