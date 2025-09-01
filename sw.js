const CACHE_NAME = 'laam-wallet-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/screenshots/screen1.png',
  '/screenshots/screen2.png'
];

// Install - cache assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  console.log('Service Worker activated!');
  event.waitUntil(self.clients.claim());
});

// Fetch - offline-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() =>
        caches.match(event.request).then(cachedResponse => 
          cachedResponse || new Response("You are offline. Content not available.")
        )
      )
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

// --------------------
// Offline Action Storage
// --------------------

// Simple localStorage placeholder (for demo)
async function getOfflineActions() {
  const actions = localStorage.getItem('offlineActions');
  return actions ? JSON.parse(actions) : [];
}

async function sendToServer(action) {
  // Replace with your API call
  console.log('Sending action to server:', action);
}

function clearOfflineActions() {
  localStorage.removeItem('offlineActions');
}

function saveActionOffline(action) {
  const actions = JSON.parse(localStorage.getItem('offlineActions') || "[]");
  actions.push(action);
  localStorage.setItem('offlineActions', JSON.stringify(actions));
}

// Sync function
async function syncActions() {
  const actions = await getOfflineActions();
  for (const action of actions) {
    await sendToServer(action);
  }
  clearOfflineActions();
}
