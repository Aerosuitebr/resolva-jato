import { toolsCatalog } from '@/lib/tools-catalog';
import { cn } from '@/lib/utils';

const LAYOUT = [
  { top: '8%', left: '2%', rotate: -12, size: 'md' },
  { top: '58%', left: '10%', rotate: 8, size: 'sm' },
  { top: '18%', left: '22%', rotate: 14, size: 'lg' },
  { top: '68%', left: '32%', rotate: -6, size: 'md' },
  { top: '12%', left: '44%', rotate: -18, size: 'sm' },
  { top: '55%', left: '52%', rotate: 10, size: 'lg' },
  { top: '22%', left: '66%', rotate: 6, size: 'md' },
  { top: '62%', left: '76%', rotate: -14, size: 'sm' },
  { top: '28%', left: '86%', rotate: 16, size: 'md' },
  { top: '70%', left: '92%', rotate: -8, size: 'lg' }
] as const;

const SIZE_CLASS = {
  sm: 'text-[0.65rem] gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'text-xs gap-2 [&_svg]:h-4 [&_svg]:w-4',
  lg: 'text-sm gap-2 [&_svg]:h-5 [&_svg]:w-5'
} as const;

interface ToolsWatermarkProps {
  className?: string;
  /** Faixa estreita do topo: nomes em linha contínua */
  variant?: 'field' | 'strip';
}

export function ToolsWatermark({ className, variant = 'field' }: ToolsWatermarkProps) {
  if (variant === 'strip') {
    const renderRow = (suffix: string) => (
      <span className="inline-flex items-center gap-8 px-4 text-[0.65rem] font-semibold uppercase tracking-[0.22em]">
        {toolsCatalog.map((tool) => (
          <span key={`${suffix}-${tool.id}`} className="inline-flex items-center gap-8">
            <span>{tool.name}</span>
            <span className="text-sky-100/15">·</span>
          </span>
        ))}
      </span>
    );

    return (
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 overflow-hidden text-sky-100/25',
          className
        )}
      >
        <div className="rj-tools-marquee absolute inset-y-0 left-0 flex min-w-max items-center whitespace-nowrap">
          {renderRow('a')}
          {renderRow('b')}
        </div>
      </div>
    );
  }

  const marks = LAYOUT.map((slot, index) => {
    const tool = toolsCatalog[index % toolsCatalog.length];
    const Icon = tool.icon;
    return { ...slot, tool, Icon };
  });

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {marks.map(({ tool, Icon, top, left, rotate, size }) => (
        <span
          key={`${tool.id}-${left}-${top}`}
          className={cn(
            'absolute inline-flex items-center font-semibold uppercase tracking-[0.14em] text-white/[0.055]',
            SIZE_CLASS[size]
          )}
          style={{ top, left, transform: `rotate(${rotate}deg)` }}
        >
          <Icon className="shrink-0 opacity-70" strokeWidth={1.75} />
          <span>{tool.name}</span>
        </span>
      ))}
    </div>
  );
}
