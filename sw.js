const CACHE_NAME = 'spiltag-inventario-v22';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instala o Service Worker e guarda os arquivos básicos na memória (Cache)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    }).then(() => self.skipWaiting()) // Força o SW novo a virar ativo na hora
  );
});

// Ativa o Service Worker e limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle das páginas imediatamente
  );
});

// Gerencia as requisições de forma inteligente (Blindado contra queda de rede)
self.addEventListener('fetch', e => {
  // Ignora requisições de POST (envio de dados para o Apps Script/nuvem)
  if (e.request.method === 'POST') return;

  e.respondWith(
    // Tenta puxar a requisição direto da rede primeiro
    fetch(e.request).catch(() => {
      // Se a rede falhar (fábrica sem internet), busca IMEDIATAMENTE no cache local
      return caches.match(e.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Se nem no cache existir, retorna página em branco mas não trava o app
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
