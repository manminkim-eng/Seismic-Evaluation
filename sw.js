/* ══════════════════════════════════════════════════
   내진성능 PWA — Service Worker  v2.0
   캐시 전략: Cache-First (오프라인 지원)
══════════════════════════════════════════════════ */
const CACHE_NAME = 'naejin-v2.1.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './header-logo.jpg',
  'https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

/* ── 설치: 정적 자산 캐시 ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] 일부 자산 캐시 실패 (외부 리소스 포함)', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* ── 활성화: 구버전 캐시 삭제 ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: Cache-First → Network Fallback ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
