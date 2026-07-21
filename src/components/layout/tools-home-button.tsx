'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Atalho para sair da área autenticada e voltar à página inicial. */
export function ToolsHomeButton() {
  return (
    <div className="mb-4">
      <Button asChild variant="outline" size="sm" className="rounded-xl">
        <Link href="/" aria-label="Voltar à página inicial">
          <Home className="h-4 w-4" />
          Home
        </Link>
      </Button>
    </div>
  );
}
