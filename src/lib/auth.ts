export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  emailVerified?: boolean;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

const USER_KEY = 'resolva-jato-user';
const TOKEN_KEY = 'resolva-jato-token';

function isBrowser() {
  return typeof window !== 'undefined';
}

/** Cache local só para namespace de storage de documentos — a sessão real é o cookie httpOnly. */
export function getSession(): AuthSession | null {
  if (!isBrowser()) return null;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (!token || !rawUser) return null;
    return { token, user: JSON.parse(rawUser) as AuthUser };
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resolva-jato-auth-change'));
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  turnstileToken?: string;
}) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
      turnstileToken: input.turnstileToken,
      language: typeof navigator !== 'undefined' ? navigator.language : undefined,
      timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
      screen:
        typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : undefined
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível criar a conta.');
  }
  return data as {
    ok: boolean;
    requiresEmailVerification: boolean;
    email: string;
    emailSent: boolean;
    emailError?: string;
    message: string;
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível entrar.');
  }
  if (data.session) {
    saveSession(data.session);
    notifyAuthChange();
  }
  return data;
}

export async function logoutUser() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  clearSession();
  notifyAuthChange();
}

export async function fetchMe() {
  const response = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
  const data = await response.json().catch(() => ({ authenticated: false }));
  if (data.authenticated && data.session) {
    saveSession(data.session);
  } else {
    clearSession();
  }
  return data as {
    authenticated: boolean;
    session?: AuthSession;
    plan?: unknown;
    planId?: string;
    usage?: unknown;
  };
}

export async function resendVerification(email: string, turnstileToken?: string) {
  const response = await fetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, turnstileToken })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível reenviar o e-mail.');
  }
  return data;
}
