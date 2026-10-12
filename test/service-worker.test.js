import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'sw.js'), 'utf8');

function workerHarness(fetchImpl = globalThis.fetch) {
  const listeners = {};
  const stores = new Map();
  const self = { location: { origin: 'https://life-quest.test' }, clients: { claim: async () => {} }, skipWaiting: async () => {}, addEventListener: (type, handler) => { listeners[type] = handler; } };
  const caches = {
    open: async key => {
      if (!stores.has(key)) stores.set(key, new Map());
      const store = stores.get(key);
      return {
        addAll: async urls => { for (const url of urls) store.set(url, new Response(`cached:${url}`)); },
        put: async (request, response) => store.set(typeof request === 'string' ? request : new URL(request.url).pathname, response),
        match: async request => store.get(typeof request === 'string' ? request : new URL(request.url).pathname)
      };
    },
    keys: async () => [...stores.keys()],
    delete: async key => stores.delete(key),
    match: async request => { const key = typeof request === 'string' ? request : new URL(request.url).pathname; for (const store of stores.values()) { const match = store.get(key); if (match) return match; } }
  };
  vm.runInNewContext(source, { self, caches, fetch: fetchImpl, URL, Response, Promise });
  return { listeners, stores };
}

test('offline navigation falls back to the cached app shell', async () => {
  const { listeners, stores } = workerHarness(async () => { throw new TypeError('offline'); });
  await listeners.install({ waitUntil: promise => promise });
  let responsePromise;
  listeners.fetch({ request: { method: 'GET', url: 'https://life-quest.test/journey', mode: 'navigate' }, respondWith: promise => { responsePromise = promise; } });
  const response = await responsePromise;
  assert.equal(await response.text(), 'cached:/index.html');
  assert.ok([...stores.keys()][0].startsWith('life-quest-shell-'));
});

test('API requests bypass offline interception and stale caches are retired on activation', async () => {
  let networkCalls = 0;
  const { listeners, stores } = workerHarness(async () => { networkCalls++; throw new TypeError('offline'); });
  stores.set('life-quest-shell-old', new Map());
  await listeners.install({ waitUntil: promise => promise });
  let apiIntercepted = false;
  listeners.fetch({ request: { method: 'GET', url: 'https://life-quest.test/api/visuals/generate', mode: 'cors' }, respondWith: () => { apiIntercepted = true; } });
  assert.equal(apiIntercepted, false);
  assert.equal(networkCalls, 0);
  await listeners.activate({ waitUntil: promise => promise });
  assert.deepEqual([...stores.keys()].filter(key => key === 'life-quest-shell-old'), []);
});
