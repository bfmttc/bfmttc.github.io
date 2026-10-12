import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'], ['.webp', 'image/webp'], ['.mp4', 'video/mp4'],
  ['.vtt', 'text/vtt; charset=utf-8'], ['.woff2', 'font/woff2'],
]);

function reject(response, status) {
  response.writeHead(status);
  response.end();
}

createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) return reject(response, 405);
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  } catch {
    return reject(response, 400);
  }
  if (pathname.split('/').some(part => part.startsWith('.'))) return reject(response, 404);
  const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) return reject(response, 404);
  if (!types.has(extname(file))) return reject(response, 404);
  let info;
  try {
    info = await stat(file);
  } catch {
    return reject(response, 404);
  }
  if (!info.isFile()) return reject(response, 404);
  let start = 0;
  let end = info.size - 1;
  let status = 200;
  const headers = {
    'Content-Type': types.get(extname(file)),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
  };
  if (request.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
    if (!range || (!range[1] && !range[2])) return reject(response, 416);
    if (!range[1]) {
      const count = Number(range[2]);
      if (count === 0) return reject(response, 416);
      start = Math.max(0, info.size - count);
    } else {
      start = Number(range[1]);
      if (range[2]) end = Math.min(Number(range[2]), end);
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) return reject(response, 416);
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length'] = Math.max(0, end - start + 1);
  response.writeHead(status, headers);
  if (request.method === 'HEAD' || info.size === 0) return response.end();
  const stream = createReadStream(file, { start, end });
  stream.on('error', () => response.destroy());
  stream.pipe(response);
}).listen(8765, '127.0.0.1', () => {
  process.stdout.write('Preview: http://127.0.0.1:8765/\n');
});
