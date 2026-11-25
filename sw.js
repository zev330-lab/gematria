const scope = self.registration.scope;
const prefix = 'gematria-shell-' + new URL(scope).pathname + '-';
const cacheName = prefix + 'v5';
const shell = ['index.html', 'styles.css', 'app.mjs', 'lookup.mjs', 'gematria.mjs', 'lexicon.mjs', 'facts.mjs', 'fact-card.mjs',
  'manifest.webmanifest', 'assets/rosette.png', 'assets/icon-192.png', 'assets/icon-512.png'];
const urls = new Set(shell.map(path => new URL(path, scope).href));
const wordsRoot = new URL('data/words/', scope).href;
const indexUrl = new URL('index.html', scope).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll([...urls])));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  const key = url.href === scope ? indexUrl : url.href;
  if (key.startsWith(wordsRoot) && key.endsWith('.json')) {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName);
      const cached = await cache.match(key);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) {
        try { await cache.put(key, response.clone()); } catch { /* Storage may be full. */ }
      }
      return response;
    })());
  } else if (urls.has(key)) {
    event.respondWith(caches.open(cacheName).then(async cache => (await cache.match(key)) || fetch(event.request)));
  }
});
