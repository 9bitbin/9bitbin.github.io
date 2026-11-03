// Pinned service worker: offline shell + push notifications
const CACHE = "soy-v79";
const BIBLE = "soy-bible-v1";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./map.js", "./config.js", "./manifest.webmanifest", "./icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== BIBLE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first for our own files (so updates show up), cache as fallback when offline.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // Bible files: cache the first time they load, then serve from cache (they never change)
  if (url.pathname.includes("/bible/") && !url.pathname.endsWith("manifest.json")) {
    e.respondWith(caches.open(BIBLE).then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});

self.addEventListener("push", (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { body: e.data && e.data.text() }; }
  const title = data.title || "Pinned";
  const options = {
    body: data.body || "New note",
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png",
    tag: data.tag || "soy-note",
    renotify: true,
    data: { url: data.url || "./" },
  };
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    (self.navigator && self.navigator.setAppBadge) ? self.navigator.setAppBadge(1).catch(() => {}) : Promise.resolve(),
  ]));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return self.clients.openWindow(e.notification.data && e.notification.data.url || "./");
    })
  );
});

// Demo mode: the page asks the worker to show a local notification
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "local-notify") {
    self.registration.showNotification("Pinned", { body: e.data.body, icon: "icons/icon-192.png", tag: "soy-note", renotify: true });
  }
});
