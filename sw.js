const CACHE = 'life-quest-shell-v1';
const SHELL = [
  '/', '/index.html', '/manifest.webmanifest',
  '/src/styles.css', '/src/polish.css', '/src/app.js', '/src/engine.js',
  '/src/scenarios.js', '/src/audio.js', '/src/audio-catalog.js',
  '/src/visuals.js', '/src/avatar.js', '/src/scene-data.js',
  '/assets/icons/icon-192.png', '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable-512.png', '/assets/icons/apple-touch-icon.png',
  '/assets/visuals/first-pay.svg', '/assets/visuals/rent-plan.svg',
  '/assets/visuals/urgent-repair.svg', '/assets/visuals/skill-investment.svg',
  '/assets/visuals/salary-review.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('life-quest-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put('/index.html', response.clone()));
      return response;
    }).catch(async () => (await caches.match('/index.html')) || Response.error()));
    return;
  }
  if (SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    })));
  }
});
