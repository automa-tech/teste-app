const CACHE_NAME = 'spiltag-inventario-v5';

const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instala o Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(assets))
      .then(() => self.skipWaiting())
  );
});

// Ativa o novo Service Worker e remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Controla as requisições
self.addEventListener('fetch', event => {

  // IMPORTANTE:
  // Nunca interfere nos POSTs enviados para o Google Apps Script
  if (event.request.method === 'POST') {
    return;
  }

  event.respondWith(
    // Primeiro tenta buscar a versão mais recente na internet
    fetch(event.request)
      .then(response => {
        // Atualiza o cache com a versão mais recente
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const copia = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copia);
          });
        }

        return response;
      })
      .catch(() => {
        // Sem internet: procura no cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Se for navegação, abre o index salvo
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      });
  );
});
