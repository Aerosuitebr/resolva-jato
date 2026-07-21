'use client';

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_ID = 'cf-turnstile-script';

export type TurnstileWidgetHandle = {
  reset: () => void;
};

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  {
    onToken: (token: string) => void;
    className?: string;
  }
>(function TurnstileWidget({ onToken, className }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';

  useImperativeHandle(ref, () => ({
    reset: () => {
      onToken('');
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  }));

  useEffect(() => {
    if (!siteKey) {
      setMissingKey(true);
      onToken('dev-bypass');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            setStatus('ready');
            onToken(token);
          },
          'expired-callback': () => {
            setStatus('ready');
            onToken('');
          },
          'error-callback': () => {
            setStatus('error');
            onToken('');
          },
          theme: 'light'
        });
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (window.turnstile) {
      renderWidget();
    } else if (existing) {
      existing.addEventListener('load', renderWidget);
      existing.addEventListener('error', () => setStatus('error'));
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = renderWidget;
      script.onerror = () => setStatus('error');
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (missingKey) {
    return (
      <p className={cn('rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800', className)}>
        Turnstile não configurado (dev). Cadastro sem captcha.
      </p>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div ref={containerRef} className="flex min-h-[65px] justify-center" />
      {status === 'loading' ? (
        <p className="text-center text-xs text-slate-500">Carregando verificação de segurança…</p>
      ) : null}
      {status === 'error' ? (
        <p className="text-center text-xs text-rose-600">
          Não foi possível carregar o captcha. Atualize a página ou desative bloqueadores.
        </p>
      ) : null}
    </div>
  );
});
