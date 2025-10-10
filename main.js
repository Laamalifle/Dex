// Register the Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('✅ Service Worker registered:', reg))
    .catch(err => console.error('SW registration failed:', err));
}

// Ask for Notification Permission
async function initNotifications() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    alert('Please allow notifications for Laam Wallet.');
    return;
  }
  await subscribeUser();
}

// Subscribe user to Push
async function subscribeUser() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array('BOH3Yt...<YOUR_PUBLIC_KEY>...')
  });

  await fetch('/api/save-subscription', {
    method: 'POST',
    body: JSON.stringify(sub),
    headers: { 'Content-Type': 'application/json' }
  });

  console.log('🔔 Subscribed for Laam Wallet notifications!');
}

// Helper function for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Initialize notification system
initNotifications();
