import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, normalize, resolve, sep } from 'node:path';
import { handleVisualGeneration } from './server/visual-generation.js';
const root = resolve(process.argv[2] || process.env.LIFE_QUEST_STATIC_ROOT || process.cwd());
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.webmanifest':'application/manifest+json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.m4a':'audio/mp4', '.wav':'audio/wav' };
http.createServer(async (req,res) => {
  try {
    if (await handleVisualGeneration(req, res, { root })) return;
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : normalize(pathname).replace(/^([/\\])+/, '');
    const target = resolve(root, relative);
    if (target !== root && !target.startsWith(root + sep)) throw new Error('Invalid path');
    const file = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[extname(relative)] || 'application/octet-stream' }); res.end(file);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(process.env.PORT || 4173, () => console.log(`LIFE QUEST: http://localhost:${process.env.PORT || 4173}`));
