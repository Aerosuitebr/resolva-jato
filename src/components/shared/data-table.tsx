import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from './empty-state';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  totalRecords?: number;
  page?: number;
  pageSize?: number;
}

export function DataTable<T>({ columns, data, totalRecords = data.length, page = 1, pageSize = 10 }: DataTableProps<T>) {
  const start = data.length ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, totalRecords);

  if (!data.length) {
    return <EmptyState title="Nenhum registro encontrado" description="Ajuste a busca ou limpe os filtros para ver mais resultados." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-rj">
      <div className="overflow-x-auto">
        <Table className="min-w-[920px]">
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Mostrando {start}-{end} de {totalRecords}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Proxima
          </Button>
        </div>
      </div>
    </div>
  );
}
