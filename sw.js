// sw.js - Laam Wallet Service Worker

// Install
self.addEventListener('install', event => {
console.log('Service Worker installing...');
self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
console.log('Service Worker activated!');
event.waitUntil(self.clients.claim());
});

// Fetch - offline fallback
self.addEventListener('fetch', event => {
event.respondWith(
fetch(event.request).catch(() => {
return new Response("You are offline. Please check your connection.");
})
);
});

// Background Sync
self.addEventListener('sync', event => {
if (event.tag === 'sync-actions') {
event.waitUntil(syncActions());
}
});

// ✅ Listen for push events
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  console.log('📨 Push received:', data);

  const title = data.title || 'Laam Wallet';
  const body = data.body || 'You have a new wallet update!';
  const icon = 'https://i.ibb.co/r28SP1bN/20250802-225108.png'; // Update with your icon link
  const badge = 'https://yourdomain.com/laam-badge.png'; // Optional small icon

  event.waitUntil
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: { url: data.url || '/' }
    })
  );
});

// ✅ Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (let client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow(event.notification.data.url);
    })
  );
});
// Example sync functions
async function syncActions() {
const actions = await getOfflineActions();
for (const action of actions) {
await sendToServer(action);
}
clearOfflineActions();
}

// Dummy placeholders
async function getOfflineActions() { return []; }
async function sendToServer(action) {}
function clearOfflineActions() {}

