'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function playAlertChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [880, 1174, 1480];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02 + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22 + index * 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.12);
      osc.stop(now + 0.28 + index * 0.12);
    });
    window.setTimeout(() => ctx.close().catch(() => undefined), 1200);
  } catch {
    // ignore audio failures
  }
}

interface EnablePushButtonProps {
  className?: string;
  variant?: 'card' | 'banner' | 'inline';
}

export function EnablePushButton({ className, variant = 'card' }: EnablePushButtonProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [supported, setSupported] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const ownerEmail = session?.user.email || '';

  const refreshState = useCallback(async () => {
    const pushOk =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(pushOk);

    try {
      const statusRes = await fetch('/api/push/subscribe');
      const status = await statusRes.json();
      setConfigured(Boolean(status.configured));
      setPublicKey(status.publicKey || '');

      if (pushOk && status.configured) {
        const reg = await navigator.serviceWorker.getRegistration('/');
        const sub = await reg?.pushManager.getSubscription();
        setEnabled(Boolean(sub) && Notification.permission === 'granted');
      }
    } catch {
      setConfigured(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.type === 'RJ_PUSH_ALERT') playAlertChime();
    }
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('rj-push');
      channel.onmessage = onMessage;
    } catch {
      // ignore
    }
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => {
      channel?.close();
      navigator.serviceWorker?.removeEventListener('message', onMessage);
    };
  }, []);

  async function enablePush() {
    if (!ownerEmail) {
      toast('Entre na conta para ativar alertas.');
      return;
    }
    if (!configured || !publicKey) {
      toast('Push ainda não configurado no servidor (chaves VAPID).');
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast('Permissão de notificação negada pelo navegador.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        }));

      const json = subscription.toJSON();
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail,
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao ativar alertas.');

      setEnabled(true);
      playAlertChime();
      toast('Alertas no celular ativados.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível ativar alertas.');
    } finally {
      setLoading(false);
    }
  }

  async function disablePush() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint, ownerEmail })
        });
        await subscription.unsubscribe();
      }
      setEnabled(false);
      toast('Alertas desativados neste dispositivo.');
    } catch {
      toast('Não foi possível desativar os alertas.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-slate-500', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Verificando alertas...
      </div>
    );
  }

  if (!supported) {
    return (
      <p className={cn('text-sm text-slate-600', className)}>
        Este navegador não suporta notificações push. No iPhone, instale o site na tela inicial.
      </p>
    );
  }

  if (!configured) {
    return (
      <p className={cn('text-sm text-amber-800', className)}>
        Alertas push disponíveis após configurar as chaves VAPID no servidor.
      </p>
    );
  }

  if (variant === 'banner' && enabled) return null;

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
          className
        )}
      >
        <div>
          <p className="text-sm font-bold text-amber-950">Push opcional (Android)</p>
          <p className="mt-1 text-xs leading-5 text-amber-900">
            No iPhone o aviso chega por WhatsApp e e-mail, sem instalar o site. Push é um extra no Android.
          </p>
        </div>
        <Button onClick={enablePush} disabled={loading || !ownerEmail} className="shrink-0 bg-amber-500 text-slate-950 hover:bg-amber-400">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          Ativar alertas
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        variant === 'card' && 'rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      {variant === 'card' ? (
        <>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Extra · push no navegador
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A entrega <strong>garantida no iPhone</strong> é por WhatsApp + e-mail (+ SMS se configurado),
            sem instalar nada. O push abaixo é um plus no Android; no iPhone só funciona se o site estiver
            na tela inicial.
          </p>
        </>
      ) : null}
      <div className={cn('flex flex-wrap gap-2', variant === 'card' && 'mt-4')}>
        {enabled ? (
          <Button variant="outline" onClick={disablePush} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
            Desativar neste aparelho
          </Button>
        ) : (
          <Button onClick={enablePush} disabled={loading || !ownerEmail}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Ativar alertas no celular
          </Button>
        )}
      </div>
      {enabled ? (
        <p className="mt-3 text-xs font-semibold text-emerald-700">Alertas ativos neste dispositivo.</p>
      ) : null}
    </div>
  );
}
