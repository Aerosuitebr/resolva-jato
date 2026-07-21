'use client';

import { useCallback, useState } from 'react';
import { lookupCep, type CepAddress } from '@/lib/cep';

type CepStatus = 'idle' | 'loading' | 'success' | 'not_found' | 'error';

export function useCep(onFound?: (address: CepAddress) => void) {
  const [status, setStatus] = useState<CepStatus>('idle');
  const [message, setMessage] = useState('');

  const search = useCallback(
    async (cep: string) => {
      const digits = cep.replace(/\D+/g, '');
      if (digits.length !== 8) {
        setStatus('idle');
        setMessage('');
        return null;
      }

      setStatus('loading');
      setMessage('Buscando endereço...');

      try {
        const address = await lookupCep(digits);
        if (!address) {
          setStatus('not_found');
          setMessage('CEP não encontrado. Preencha manualmente.');
          return null;
        }
        setStatus('success');
        setMessage('Endereço preenchido automaticamente.');
        onFound?.(address);
        return address;
      } catch {
        setStatus('error');
        setMessage('Não foi possível consultar o CEP. Preencha manualmente.');
        return null;
      }
    },
    [onFound]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setMessage('');
  }, []);

  return { status, message, search, reset };
}
