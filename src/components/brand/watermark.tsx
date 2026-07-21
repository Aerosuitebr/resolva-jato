import { cn } from '@/lib/utils';

interface WatermarkProps {
  className?: string;
}

export function Watermark({ className }: WatermarkProps) {
  return (
    <svg viewBox="0 0 420 240" className={cn('pointer-events-none text-slate-900 opacity-[0.05]', className)} aria-hidden="true">
      <path fill="currentColor" d="M28 144c82-58 180-96 294-115 15-3 29 8 30 24l1 18-132 50 88 43-29 31-145-42-72 45-35-54Z" />
      <path fill="currentColor" d="M278 166a42 42 0 1 0 76 18l22 8 12-28-22-9a44 44 0 0 0-4-17l19-14-17-25-19 14a42 42 0 0 0-19-7l-5-23-30 6 5 23a42 42 0 0 0-18 13l-22-8-12 28 22 8c0 5 .8 9 2 13Zm49-25a19 19 0 1 1-15 35 19 19 0 0 1 15-35Z" />
    </svg>
  );
}
