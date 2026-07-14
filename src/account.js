const authStorageKey = 'resolva-jato-auth';

function getAuthState() {
  try {
    return JSON.parse(localStorage.getItem(authStorageKey)) || null;
  } catch {
    return null;
  }
}

function setAuthState(state) {
  if (!state) {
    localStorage.removeItem(authStorageKey);
    return;
  }
  localStorage.setItem(authStorageKey, JSON.stringify(state));
}

export function getSession() {
  return getAuthState();
}

export function isCloudReady() {
  return Boolean(getAuthState()?.token);
}

async function request(path, options = {}) {
  const session = getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Não foi possível concluir a operação.');
  }

  return payload;
}

export async function registerAccount({ name, email, password, planId = 'gratis' }) {
  const payload = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, planId })
  });

  setAuthState({ token: payload.token, email: payload.email, name: payload.name, planId: payload.planId });
  return payload;
}

export async function loginAccount({ email, password }) {
  const payload = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  setAuthState({ token: payload.token, email: payload.email, name: payload.name, planId: payload.planId });
  return payload;
}

export function logoutAccount() {
  setAuthState(null);
}

export async function pullCloudData() {
  return request('/api/sync');
}

export async function pushCloudData(data) {
  return request('/api/sync', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function pushUsageState(usage) {
  if (!isCloudReady()) return null;

  return request('/api/usage', {
    method: 'PUT',
    body: JSON.stringify({ usage })
  });
}

export async function pullUsageState() {
  if (!isCloudReady()) return null;
  return request('/api/usage');
}

export function exportLocalBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `resolva-jato-backup-${stamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importLocalBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error('Arquivo de backup inválido.'));
      }
    };

    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsText(file);
  });
}
