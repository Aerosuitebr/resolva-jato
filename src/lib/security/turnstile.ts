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

  if (!token?.trim() || token.trim() === 'dev-bypass') {
    return { ok: false, error: 'Confirme o captcha para continuar.' };
  }

  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token.trim());
    // Só envia remoteip se for um IP real — "unknown"/localhost quebra a validação.
    const remoteIp = ip?.trim();
    if (remoteIp && isPublicIp(remoteIp)) {
      body.set('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      const codes = data['error-codes']?.join(', ');
      if (process.env.NODE_ENV !== 'production' && codes) {
        console.warn('[turnstile] siteverify falhou:', codes);
      }
      return { ok: false, error: 'Captcha inválido. Atualize o captcha e tente novamente.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Não foi possível validar o captcha.' };
  }
}

function isPublicIp(ip: string) {
  if (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') return false;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('fc') || ip.startsWith('fd')) {
    return false;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return false;
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) || ip.includes(':');
}

export function isTurnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}
