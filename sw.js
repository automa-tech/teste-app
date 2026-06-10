self.addEventListener('fetch', function(event) {
    // Mantém o app funcional online/offline básico
    event.respondWith(fetch(event.request));
});
