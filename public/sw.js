const CACHE_NAME = "gympro-cache-v2";

const STATIC_ASSETS = [
  "/",
  "/icon-192.png",
  "/icon-512.png"
];


// ---------------- INSTALL ----------------

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});


// ---------------- ACTIVATE ----------------

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );

  self.clients.claim();
});


// ---------------- FETCH ----------------

self.addEventListener("fetch", (event) => {

  // only GET
  if (event.request.method !== "GET") return;

  // skip cross origin (API / workers)
  if (!event.request.url.startsWith(self.location.origin)) return;

  // ❌ do not cache html / json / api
  if (
    event.request.url.endsWith(".html") ||
    event.request.url.endsWith(".json") ||
    event.request.url.includes("/members") ||
    event.request.url.includes("/packages") ||
    event.request.url.includes("/payments")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {

      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {

          if (!response || response.status !== 200) {
            return response;
          }

          const clone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });

          return response;
        })
        .catch(() => {
          return caches.match("/");
        });

    })
  );

});


// ---------------- MESSAGE ----------------

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});