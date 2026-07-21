import { cn } from '@/lib/utils';

/** Placeholder animado para listas/cards enquanto carrega. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-200/80', className)}
      aria-hidden
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      role="status"
      aria-label="Carregando conteúdo"
    >
      <div className="flex gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className={cn('h-3', index === lines - 1 ? 'w-1/2' : 'w-full')} />
        ))}
      </div>
      <Skeleton className="mt-4 ml-auto h-11 w-36 rounded-xl" />
    </div>
  );
}

export function SkeletonDocumentPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      role="status"
      aria-label="Gerando prévia do documento"
    >
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="space-y-3 p-6">
        <Skeleton className="mx-auto h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="mt-6 h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="mt-8 h-16 w-40" />
      </div>
    </div>
  );
}
