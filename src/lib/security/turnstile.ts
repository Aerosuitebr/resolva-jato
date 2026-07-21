export async function verifyTurnstileToken(
  token: string | undefined | null,
  ip?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  // Dev / staging sem chave: não bloqueia (documentado no .env.example)
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, error: 'Turnstile não configurado no servidor.' };
    }
    return { ok: true };
  }

  if (!token?.trim()) {
    return { ok: false, error: 'Confirme o captcha para continuar.' };
  }

  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token.trim());
    if (ip) body.set('remoteip', ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      return { ok: false, error: 'Captcha inválido. Tente novamente.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Não foi possível validar o captcha.' };
  }
}

export function isTurnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}
