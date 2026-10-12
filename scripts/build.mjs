import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { generateIcons } from './generate-pwa-icons.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'dist');
if (out === root || !out.startsWith(root + sep)) throw new Error('Unsafe build output path');
await generateIcons(resolve(root, 'assets/icons'));
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const item of ['index.html', 'manifest.webmanifest', 'sw.js', 'src', 'assets']) {
  await cp(resolve(root, item), resolve(out, item), { recursive: true });
}
const manifest = JSON.parse(await readFile(resolve(out, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons) {
  const file = resolve(out, icon.src.slice(1));
  if ((await stat(file)).size < 100) throw new Error(`Missing or invalid app icon: ${icon.src}`);
}
const workerPath = resolve(out, 'sw.js');
let worker = await readFile(workerPath, 'utf8');
const shell = worker.match(/const SHELL = \[([\s\S]*?)\];/)?.[1] || '';
const shellFiles = [...shell.matchAll(/'([^']+)'/g)].map(match => match[1]).filter(path => path.startsWith('/') && path !== '/');
const hash = createHash('sha256');
for (const file of [resolve(out, 'index.html'), resolve(out, 'manifest.webmanifest'), ...shellFiles.map(path => resolve(out, path.slice(1)))]) hash.update(await readFile(file));
worker = worker.replace(/const CACHE = '[^']+';/, `const CACHE = 'life-quest-shell-${hash.digest('hex').slice(0, 12)}';`);
await writeFile(workerPath, worker);
console.log(`Built static LIFE QUEST PWA in ${out}`);
