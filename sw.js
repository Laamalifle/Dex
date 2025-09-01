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

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Laam Wallet', body: 'You have a new notification.' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png'
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
