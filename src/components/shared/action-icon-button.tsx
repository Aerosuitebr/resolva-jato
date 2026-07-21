import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface ActionIconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

export function ActionIconButton({ icon: Icon, label, onClick, variant = 'default' }: ActionIconButtonProps) {
  return (
    <Tooltip label={label}>
      <Button
        type="button"
        size="icon"
        variant={variant === 'danger' ? 'danger' : 'ghost'}
        aria-label={label}
        onClick={onClick}
        className={variant === 'danger' ? '' : 'hover:bg-sky-50 hover:text-sky-700'}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </Tooltip>
  );
}
