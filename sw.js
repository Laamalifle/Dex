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

// Fetch
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

// Example function to sync offline actions
async function syncActions() {
  const actions = await getOfflineActions();
  for (const action of actions) {
    await sendToServer(action);
  }
  clearOfflineActions();
}

// Dummy placeholder functions (implement according to your app)
async function getOfflineActions() {
  // Fetch actions saved in IndexedDB or localStorage
  return [];
}
async function sendToServer(action) {
  // Send action to server API
}
function clearOfflineActions() {
  // Clear synced actions from storage
}
