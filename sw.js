// Mail Merge PWA — Service Worker
//
// Deliberately minimal. index.html, app.js, and styles.css are NEVER
// cached here — every load fetches them straight from the network,
// so you always get whatever you most recently deployed. No version
// number to remember, nothing to bump, nothing to go stale.
//
// The only thing cached is the small set of icon files below, since
// they never change. Everything else (the app's own files, the Apps
// Script API, Google sign-in) passes straight through untouched.

const CACHE_NAME = 'mailmerge-icons-v1';
const CACHED_ASSETS = [
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isIcon = CACHED_ASSETS.some((path) => url.pathname.endsWith(path));

  if (isIcon) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Everything else: don't intervene. Let the browser fetch normally —
  // index.html, app.js, styles.css, the Apps Script API, Google auth,
  // all of it always goes live.
});
