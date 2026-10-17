import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, normalize, resolve } from 'node:path';

const root = resolve('.');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.json':'application/json' };
createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname)).replace(/^[/\\]+/, '') || 'dashboard.html';
  const target = resolve(root, path);
  if (!target.startsWith(root) || !existsSync(target) || statSync(target).isDirectory()) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, {'Content-Type':types[extname(target)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff'});
  createReadStream(target).pipe(response);
}).listen(4173, () => console.log('Urge Zero dashboard: http://localhost:4173/dashboard.html'));
