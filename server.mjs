import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, '.data');
const usersDir = path.join(dataDir, 'users');
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '0.0.0.0';

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

await fs.mkdir(usersDir, { recursive: true });

function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function emptyUsage() {
  return {
    periodStartedAt: new Date().toISOString(),
    clientsCreatedMonth: 0,
    documentsMonth: 0,
    appointmentsCreatedMonth: 0
  };
}

function userFile(email) {
  const id = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  return path.join(usersDir, `${id}.json`);
}

async function readUser(email) {
  try {
    return JSON.parse(await fs.readFile(userFile(email), 'utf8'));
  } catch {
    return null;
  }
}

async function writeUser(email, user) {
  await fs.writeFile(userFile(email), JSON.stringify(user, null, 2), 'utf8');
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

function getBearerToken(request) {
  const header = request.headers.authorization || '';
  const [type, token] = header.split(' ');
  return type === 'Bearer' && token ? token : '';
}

async function getUserByToken(token) {
  if (!token) return null;
  const files = await fs.readdir(usersDir);

  for (const file of files) {
    const user = JSON.parse(await fs.readFile(path.join(usersDir, file), 'utf8'));
    if (user.token === token) return user;
  }

  return null;
}

async function handleApi(request, response, pathname) {
  if (pathname === '/api/auth/register' && request.method === 'POST') {
    const body = await readBody(request);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!name || !email || password.length < 6) {
      return json(response, 400, { error: 'Informe nome, e-mail válido e senha com ao menos 6 caracteres.' });
    }

    if (await readUser(email)) {
      return json(response, 409, { error: 'Este e-mail já possui conta.' });
    }

    const token = createToken();
    const user = {
      name,
      email,
      passwordHash: hashPassword(password),
      token,
      planId: body.planId || 'gratis',
      usage: emptyUsage(),
      createdAt: new Date().toISOString(),
      data: {
        professional: { proposal: {}, clients: [], appointments: [] },
        planId: body.planId || 'gratis',
        usage: emptyUsage()
      }
    };

    await writeUser(email, user);
    return json(response, 201, { token, email, name, planId: user.planId });
  }

  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await readBody(request);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = await readUser(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return json(response, 401, { error: 'E-mail ou senha incorretos.' });
    }

    user.token = createToken();
    user.usage = user.usage || user.data?.usage || emptyUsage();
    await writeUser(email, user);
    return json(response, 200, { token: user.token, email: user.email, name: user.name, planId: user.planId || 'gratis' });
  }

  const token = getBearerToken(request);
  const user = await getUserByToken(token);

  if (!user) {
    return json(response, 401, { error: 'Sessão expirada. Entre novamente.' });
  }

  if (pathname === '/api/sync' && request.method === 'GET') {
    return json(response, 200, {
      email: user.email,
      name: user.name,
      planId: user.planId || 'gratis',
      usage: user.usage || user.data?.usage || emptyUsage(),
      data: user.data || {}
    });
  }

  if (pathname === '/api/sync' && request.method === 'PUT') {
    const body = await readBody(request);
    user.data = body.data || body;
    user.usage = body.usage || body.data?.usage || user.usage || emptyUsage();
    user.planId = body.planId || user.planId || 'gratis';
    user.updatedAt = new Date().toISOString();
    await writeUser(user.email, user);
    return json(response, 200, { ok: true, updatedAt: user.updatedAt });
  }

  if (pathname === '/api/usage' && request.method === 'GET') {
    return json(response, 200, {
      usage: user.usage || user.data?.usage || emptyUsage()
    });
  }

  if (pathname === '/api/usage' && request.method === 'PUT') {
    const body = await readBody(request);
    user.usage = body.usage || user.usage || emptyUsage();
    user.data = {
      ...(user.data || {}),
      usage: user.usage
    };
    user.updatedAt = new Date().toISOString();
    await writeUser(user.email, user);
    return json(response, 200, { ok: true, usage: user.usage, updatedAt: user.updatedAt });
  }

  return json(response, 404, { error: 'Rota não encontrada.' });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/api/')) {
    try {
      await handleApi(request, response, pathname);
    } catch (error) {
      json(response, 500, { error: error.message || 'Erro interno.' });
    }
    return;
  }

  const target = path.normalize(path.join(root, pathname === '/' ? 'index.html' : pathname));

  if (!target.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const data = await fs.readFile(target);
    response.writeHead(200, { 'Content-Type': types.get(path.extname(target)) || 'application/octet-stream' });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Resolva Jato disponível em http://${host}:${port}`);
});
