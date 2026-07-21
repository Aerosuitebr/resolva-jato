export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || '';
}

export function getVapidPrivateKey() {
  return process.env.VAPID_PRIVATE_KEY?.trim() || '';
}

export function getVapidSubject() {
  return process.env.VAPID_SUBJECT?.trim() || 'mailto:contato@resolvajato.local';
}

export function isPushConfigured() {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}
