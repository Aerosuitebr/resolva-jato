/**
 * Device ID do script Mercado Pago (security.js → MP_DEVICE_SESSION_ID).
 * Usado no header X-meli-session-id ao criar a preferência (Checkout Pro).
 */

declare global {
  interface Window {
    MP_DEVICE_SESSION_ID?: string;
  }
}

export async function getMpDeviceSessionId(timeoutMs = 2500): Promise<string | undefined> {
  if (typeof window === 'undefined') return undefined;

  const read = () => {
    const id = window.MP_DEVICE_SESSION_ID;
    return typeof id === 'string' && id.trim() ? id.trim() : undefined;
  };

  const immediate = read();
  if (immediate) return immediate;

  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, 50));
    const next = read();
    if (next) return next;
  }

  return read();
}
