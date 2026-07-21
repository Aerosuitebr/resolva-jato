import Image from 'next/image';
import rjClaro from '@/assets/RJ_claro.png';
import rjEscuro from '@/assets/RJ_escuro.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  collapsed?: boolean;
  variant?: 'sidebar' | 'marketing' | 'hero' | 'app' | 'auth' | 'footer';
  className?: string;
}

export function Logo({ collapsed = false, variant = 'marketing', className }: LogoProps) {
  const isHero = variant === 'hero' || variant === 'footer';
  const src = isHero ? rjClaro : rjEscuro;

  return (
    <Image
      src={src}
      alt="Resolva Jato, recursos e ferramentas"
      priority
      className={cn(
        'w-auto object-contain object-left',
        collapsed && 'h-10 max-w-[3rem]',
        !collapsed && variant === 'hero' && 'h-[6rem] sm:h-[7.5rem] lg:h-[9rem]',
        !collapsed && variant === 'footer' && 'h-14 sm:h-16',
        !collapsed && variant === 'auth' && 'mx-auto h-[5.25rem] sm:h-[6rem]',
        !collapsed && variant === 'marketing' && 'h-[4.25rem] sm:h-[5rem] lg:h-[5.5rem]',
        !collapsed && variant === 'app' && 'h-14 sm:h-16 lg:h-[4.5rem]',
        !collapsed && variant === 'sidebar' && 'h-14',
        className
      )}
    />
  );
}
