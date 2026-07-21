import { Suspense } from 'react';
import { BuscaClient } from './search-client';

export default function BuscaPage() {
  return (
    <div className="space-y-6">
      <Suspense>
        <BuscaClient />
      </Suspense>
    </div>
  );
}
