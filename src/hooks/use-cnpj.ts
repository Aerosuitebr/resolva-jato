'use client';

import { useCallback, useState } from 'react';
import { lookupCnpj, type CnpjCompany } from '@/lib/cnpj';

type CnpjStatus = 'idle' | 'loading' | 'success' | 'not_found' | 'error';

export function useCnpj(onFound?: (company: CnpjCompany) => void) {
  const [status, setStatus] = useState<CnpjStatus>('idle');
  const [message, setMessage] = useState('');

  const search = useCallback(
    async (cnpj: string) => {
      const digits = cnpj.replace(/\D+/g, '');
      if (digits.length !== 14) {
        setStatus('idle');
        setMessage('');
        return null;
      }

      setStatus('loading');
      setMessage('Consultando CNPJ na Receita...');

      try {
        const company = await lookupCnpj(digits);
        if (!company) {
          setStatus('not_found');
          setMessage('CNPJ não encontrado. Preencha manualmente.');
          return null;
        }
        setStatus('success');
        setMessage('Dados do CNPJ preenchidos automaticamente.');
        onFound?.(company);
        return company;
      } catch {
        setStatus('error');
        setMessage('Não foi possível consultar o CNPJ. Preencha manualmente.');
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
