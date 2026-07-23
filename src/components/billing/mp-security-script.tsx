'use client';

import { useEffect } from 'react';

const SCRIPT_ID = 'mp-security-js';
const SCRIPT_SRC = 'https://www.mercadopago.com/v2/security.js';

/**
 * Carrega o fingerprint Device ID do Mercado Pago (recomendação antifraude).
 * view=checkout: páginas onde o usuário inicia pagamento.
 */
export function MpSecurityScript({ view = 'checkout' }: { view?: string }) {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute('view', view);
    document.body.appendChild(script);
  }, [view]);

  return null;
}
