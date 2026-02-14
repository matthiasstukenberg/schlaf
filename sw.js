// ═══════════════════════════════════════════════════════
//  SERVICE WORKER – Was ist das?
//
//  Ein Service Worker ist ein kleines Script, das im
//  Hintergrund läuft – auch wenn die App geschlossen ist.
//  Seine wichtigste Aufgabe hier: Caching.
//
//  Beim ersten Öffnen speichert er alle App-Dateien lokal
//  auf dem Gerät. Danach läuft die App komplett offline –
//  kein Internet nötig. Perfekt für eine Schlaf-App!
// ═══════════════════════════════════════════════════════

// Version des Caches – ändere diese Zahl wenn du die App
// aktualisierst, damit der Cache automatisch erneuert wird
const CACHE_NAME = 'schlaf-v1';

// Diese Dateien werden beim ersten Öffnen gecacht
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ── Install: Dateien in den Cache laden ─────────────────
// Wird einmalig beim ersten Besuch ausgeführt
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Sofort aktivieren, ohne auf alte Tabs zu warten
  self.skipWaiting();
});

// ── Activate: Alte Cache-Versionen aufräumen ────────────
// Wird nach einem Update ausgeführt
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: Netzwerkanfragen abfangen ────────────────────
// Bei jeder Anfrage: erst Cache prüfen, dann Netzwerk
// "Cache First" Strategie – ideal für eine Offline-App
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      // Aus Cache liefern falls vorhanden
      if (cached) return cached;

      // Sonst vom Netzwerk laden (z.B. Google Fonts)
      return fetch(event.request).catch(() => {
        // Wenn offline UND nicht gecacht: Hauptseite zeigen
        return caches.match('./index.html');
      });
    })
  );
});
