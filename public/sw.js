/* Resolva Jato — service worker for Web Push alerts */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Resolva Jato',
    body: 'Você tem um novo aviso.',
    url: '/ferramentas/orcamentos',
    tag: 'resolva-jato',
    playSound: true,
    vibrate: [200, 100, 200, 100, 400],
    requireInteraction: true
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // keep defaults
  }

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: data.tag,
        renotify: true,
        requireInteraction: data.requireInteraction,
        vibrate: data.vibrate,
        data: { url: data.url }
      });

      if (data.playSound) {
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clientsList) {
          client.postMessage({ type: 'RJ_PUSH_ALERT', title: data.title, body: data.body });
        }
        try {
          const channel = new BroadcastChannel('rj-push');
          channel.postMessage({ type: 'RJ_PUSH_ALERT', title: data.title, body: data.body });
          channel.close();
        } catch {
          // BroadcastChannel may be unavailable
        }
      }
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/ferramentas/orcamentos';
  const absolute = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientsList) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            await client.navigate(absolute);
          }
          return;
        }
      }
      await self.clients.openWindow(absolute);
    })()
  );
});
