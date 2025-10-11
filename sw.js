const CACHE_NAME = 'laam-wallet-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://i.ibb.co/r28SP1bN/20250802-225108.png'
];

// ✅ INSTALL
self.addEventListener('install', event => {
  console.log('🚀 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ✅ ACTIVATE
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated!');
  event.waitUntil(self.clients.claim());
});

// ✅ FETCH - With Offline Fallback (modern HTML message)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => {
          return new Response(`
            <html>
              <head>
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <title>Offline - Laam Wallet</title>
                <style>
                  body {
                    margin: 0;
                    background: #0f0f23;
                    color: #f0f0f0;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                  }
                  .card {
                    background: rgba(26, 26, 46, 0.9);
                    padding: 30px;
                    border-radius: 20px;
                    box-shadow: 0 0 25px rgba(0,0,0,0.3);
                    max-width: 300px;
                  }
                  img {
                    width: 80px;
                    height: 80px;
                    margin-bottom: 15px;
                  }
                  h2 {
                    color: #7c3aed;
                    margin-bottom: 10px;
                  }
                  p {
                    color: #a0a0c0;
                    font-size: 15px;
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <img src="https://i.ibb.co/r28SP1bN/20250802-225108.png" alt="Laam Wallet Logo" />
                  <h2>You're Offline</h2>
                  <p>Please check your internet connection<br>and try again.</p>
                </div>
              </body>
            </html>
          `, { headers: { 'Content-Type': 'text/html' } });
        })
      );
    })
  );
});

// ✅ BACKGROUND SYNC
self.addEventListener('sync', event => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncActions());
  }
});

// ✅ PUSH NOTIFICATIONS
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  console.log('📩 Push received:', data);

  const title = data.title || 'Laam Wallet';
  const body = data.body || 'You have a new wallet update!';
  const icon = 'https://i.ibb.co/r28SP1bN/20250802-225108.png';
  const badge = 'https://i.ibb.co/r28SP1bN/20250802-225108.png';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: { url: data.url || '/' }
    })
  );
});

// ✅ HANDLE NOTIFICATION CLICK
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

// ✅ SYNC FUNCTIONS (offline actions placeholder)
async function syncActions() {
  const actions = await getOfflineActions();
  for (const action of actions) {
    await sendToServer(action);
  }
  clearOfflineActions();
}

async function getOfflineActions() { return []; }
async function sendToServer(action) {}
function clearOfflineActions() {}
