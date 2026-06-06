/** Runtime cache for hashed Vite assets only — never cache the HTML shell. */
const CACHE = "gnp-assets-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isDocumentRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html")
  );
}

function isHashedAsset(url) {
  return url.pathname.includes("/assets/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.url.includes("/api/")) return;

  const url = new URL(request.url);

  // Always fetch fresh HTML so new deploys load immediately.
  if (isDocumentRequest(request)) {
    event.respondWith(fetch(request));
    return;
  }

  // Hashed build files are safe to cache (filename changes each deploy).
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }
});
