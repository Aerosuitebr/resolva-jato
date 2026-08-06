'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'rj_analytics_consent';
type Consent = 'accepted' | 'rejected' | null;

export function AnalyticsScripts() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    setConsent(saved === 'accepted' || saved === 'rejected' ? saved : null);
    setReady(true);
  }, []);

  function choose(next: Exclude<Consent, null>) {
    window.localStorage.setItem(CONSENT_KEY, next);
    setConsent(next);
  }

  const enabled = consent === 'accepted';
  const locale = pathname === '/en' || pathname.startsWith('/en/')
    ? 'en'
    : pathname === '/es' || pathname.startsWith('/es/')
      ? 'es'
      : 'pt-BR';
  const consentCopy = {
    'pt-BR': {
      label: 'Preferências de privacidade',
      text: 'Usamos métricas opcionais para entender quais páginas ajudam mais. Nenhum dado de pagamento é enviado. Você pode aceitar ou continuar apenas com cookies essenciais.',
      essentials: 'Apenas essenciais',
      accept: 'Aceitar métricas'
    },
    en: {
      label: 'Privacy preferences',
      text: 'We use optional analytics to understand which pages are most helpful. No payment data is sent. You can accept or continue with essential cookies only.',
      essentials: 'Essential only',
      accept: 'Accept analytics'
    },
    es: {
      label: 'Preferencias de privacidad',
      text: 'Usamos métricas opcionales para saber qué páginas son más útiles. No se envían datos de pago. Puedes aceptar o continuar solo con cookies esenciales.',
      essentials: 'Solo esenciales',
      accept: 'Aceptar métricas'
    }
  }[locale];

  return (
    <>
      {enabled && gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(gaId)}, {
                anonymize_ip: true,
                allow_google_signals: false
              });
            `}
          </Script>
        </>
      ) : null}
      {enabled && clarityId ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", ${JSON.stringify(clarityId)});
          `}
        </Script>
      ) : null}
      {ready && consent === null && (gaId || clarityId) ? (
        <aside
          aria-label={consentCopy.label}
          className="fixed inset-x-2 bottom-2 z-[100] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md sm:bottom-3 sm:flex sm:items-center sm:gap-5 sm:p-4"
        >
          <p className="flex-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
            {consentCopy.text}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-0 sm:flex">
            <button
              type="button"
              className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => choose('rejected')}
            >
              {consentCopy.essentials}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white"
              onClick={() => choose('accepted')}
            >
              {consentCopy.accept}
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
