import { cn } from '@/lib/utils';

export interface AvatarProps {
  fallback: string;
  className?: string;
}

export function Avatar({ fallback, className }: AvatarProps) {
  return (
    <div className={cn('grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-200 to-sky-500 text-sm font-bold text-slate-950', className)}>
      {fallback}
    </div>
  );
}
