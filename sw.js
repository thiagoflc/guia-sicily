/* ==========================================================================
   Service Worker — Portal Sicília Orientale
   Estratégia por tipo de recurso:
     • HTML das páginas   → Network First  (atualiza online, fallback offline)
     • CDN / assets       → Cache First    (Leaflet, Alpine, CARTO tiles, fonts)
     • Imagens Wikimedia  → Cache First    (imagens raramente mudam)

   Para forçar atualização do cache: incrementar o número da versão abaixo.
   ========================================================================== */

const VERSION      = 'v1';
const CACHE_SHELL  = `sicily-shell-${VERSION}`;
const CACHE_ASSETS = `sicily-assets-${VERSION}`;
const CACHE_IMAGES = `sicily-images-${VERSION}`;

const PAGES = [
  '',
  'index.html',
  'ortigia.html',
  'noto.html',
  'ragusa.html',
  'modica.html',
  'taormina.html',
  'taormina-ii.html',
  'taormina-iii.html',
  'etna.html',
  'etna-ii.html',
];

const CDN_HOSTS = [
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'basemaps.cartocdn.com',
];

// ─── Install: pré-cacheia todas as páginas HTML ───────────────────────────────
self.addEventListener('install', event => {
  const base = self.registration.scope;
  event.waitUntil(
    caches.open(CACHE_SHELL)
      .then(cache =>
        // allSettled: não falha mesmo se uma página 404
        Promise.allSettled(PAGES.map(p => cache.add(base + p)))
      )
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: remove caches de versões anteriores ───────────────────────────
self.addEventListener('activate', event => {
  const KEEP = [CACHE_SHELL, CACHE_ASSETS, CACHE_IMAGES];
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => !KEEP.includes(k)).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: roteamento por tipo de recurso ────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.protocol === 'chrome-extension:') return;

  const scope = new URL(self.registration.scope);

  // 1. Páginas do portal → Network First
  if (url.origin === scope.origin && url.pathname.startsWith(scope.pathname)) {
    event.respondWith(networkFirst(req, CACHE_SHELL, scope.href + 'index.html'));
    return;
  }

  // 2. Imagens do Wikimedia → Cache First
  if (url.hostname.includes('wikimedia.org') || url.hostname.includes('upload.wikimedia')) {
    event.respondWith(cacheFirst(req, CACHE_IMAGES));
    return;
  }

  // 3. CDN (scripts, fontes, tiles de mapa) → Cache First
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(cacheFirst(req, CACHE_ASSETS));
    return;
  }

  // Restante: rede direta (sem interceptar)
});

// ─── Estratégias ─────────────────────────────────────────────────────────────

/** Network First — tenta rede, cai no cache se offline */
async function networkFirst(request, cacheName, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response('<h1>Offline</h1><p>Abra o guia online uma vez para ativá-lo offline.</p>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 });
  }
}

/** Cache First — serve do cache; busca na rede e armazena se não encontrar */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    // Não armazena respostas de erro (evita cachear 4xx/5xx)
    if (response.status < 400) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Recurso não está em cache e rede falhou — retorna 503 silencioso
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}
