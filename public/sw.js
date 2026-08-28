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
