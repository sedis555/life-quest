import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFile(resolve(root, path), 'utf8');

test('PWA manifest is root scoped and references correctly sized local icons', async () => {
  const manifest = JSON.parse(await read('manifest.webmanifest'));
  assert.equal(manifest.name, 'LIFE QUEST');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.start_url, '/');
  for (const icon of manifest.icons) {
    assert.equal(icon.type, 'image/png');
    const data = await readFile(resolve(root, icon.src.slice(1)));
    assert.deepEqual([...data.subarray(0, 8)], [137,80,78,71,13,10,26,10]);
    assert.equal(data.readUInt32BE(16), Number(icon.sizes.split('x')[0]));
    assert.equal(data.readUInt32BE(20), Number(icon.sizes.split('x')[1]));
  }
  assert.equal((await stat(resolve(root, 'assets/icons/apple-touch-icon.png'))).size > 100, true);
});

test('service worker caches only authored shell assets and bypasses API and generated responses', async () => {
  const sw = await read('sw.js');
  assert.match(sw, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(sw, /request\.mode === 'navigate'/);
  assert.match(sw, /\/src\/scenarios\.js/);
  assert.match(sw, /\/assets\/visuals\/first-pay\.svg/);
  assert.doesNotMatch(sw, /assets\/generated/);
  assert.doesNotMatch(sw, /localStorage/);
  const shell = sw.match(/const SHELL = \[([\s\S]*?)\];/)?.[1] || '';
  const paths = [...shell.matchAll(/'([^']+)'/g)].map(match => match[1]).filter(path => path.startsWith('/') && path !== '/');
  for (const path of paths) assert.ok((await stat(resolve(root, path.slice(1)))).isFile(), `Precached file exists: ${path}`);
});

test('production build copies the playable shell without server or environment files', async () => {
  const build = await read('scripts/build.mjs');
  for (const source of ['index.html', 'manifest.webmanifest', 'sw.js', 'src', 'assets']) assert.ok(build.includes(`'${source}'`));
  assert.doesNotMatch(build, /\.env|server\.mjs|server\//);
});
