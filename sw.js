// sw.js — Service Worker สำหรับ PWA
// Cache ไฟล์หลักไว้ใช้ offline

const CACHE_NAME = "rapo-v1";
const PRECACHE = [
  "/rapo-app/index.html",
  "/rapo-app/firebase-config.js",
  "/rapo-app/auth.js",
  "/rapo-app/assets/logo.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Network first → fallback to cache
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
