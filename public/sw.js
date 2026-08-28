/**
 * Service worker aplikacji FutureBody Trainer.
 *
 * Strategie:
 * - nawigacja: najpierw sieć, przy jej braku ostatnia zapisana wersja powłoki;
 * - zasoby statyczne (skrypty, style, obrazy, czcionki): z pamięci, z odświeżeniem
 *   w tle, więc kolejne wejście jest natychmiastowe i zawsze aktualne;
 * - zapytania do bazy i inne żądania POST nie są nigdy zapisywane.
 *
 * Nazwa pamięci zawiera wersję — zmiana wersji usuwa poprzednie zasoby.
 */

const VERSION = "fb-v2";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const SHELL_URL = "/";

const PRECACHE = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/futurebody-logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

function isAsset(request) {
  return ["script", "style", "image", "font"].includes(request.destination);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Powłoka aplikacji: świeża, gdy jest sieć; zapisana, gdy jej nie ma.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(SHELL_URL, copy));
          return response;
        })
        .catch(() => caches.match(SHELL_URL).then((cached) => cached ?? Response.error())),
    );
    return;
  }

  if (!isAsset(request)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});

self.addEventListener("push", (event) => {
  const fallback = { title: "FutureBody Trainer", body: "Zbliża się zaplanowany trening.", url: "/" };
  let data = fallback;
  try {
    data = { ...fallback, ...(event.data ? event.data.json() : {}) };
  } catch {
    data = fallback;
  }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "futurebody-training-reminder",
    renotify: true,
    data: { url: data.url || "/" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => "focus" in client);
    return existing ? existing.focus() : clients.openWindow(targetUrl);
  }));
});
