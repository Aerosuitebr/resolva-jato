import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(root, 'out');
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '0.0.0.0';

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8']
]);

function contentType(filePath) {
  return types.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
}

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return path.join(base, normalized);
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function resolveFile(urlPath) {
  const cleanPath = urlPath === '/' ? '/index.html' : urlPath;
  const direct = safeJoin(staticDir, cleanPath);
  if (await fileExists(direct)) return direct;
  const withHtml = safeJoin(staticDir, `${cleanPath}.html`);
  if (await fileExists(withHtml)) return withHtml;
  const nestedIndex = safeJoin(staticDir, path.join(cleanPath, 'index.html'));
  if (await fileExists(nestedIndex)) return nestedIndex;
  return safeJoin(staticDir, 'index.html');
}

const server = http.createServer(async (request, response) => {
  try {
    const filePath = await resolveFile(request.url || '/');
    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentType(filePath),
      'Cache-Control': filePath.includes(`${path.sep}_next${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache'
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('RJ Resolva Jato nao encontrado. Rode npm run build primeiro.');
  }
});

server.listen(port, host, () => {
  console.log(`RJ Resolva Jato pronto em http://localhost:${port}`);
});
