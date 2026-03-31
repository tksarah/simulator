// Minimal noop service worker to silence GET /sw.js 404 logs.
// This worker does nothing harmful and immediately takes control.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  // No caching; let all requests pass through.
});
