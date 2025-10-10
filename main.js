// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    console.log('Service Worker registered:', reg);
  });
}

// Push subscription
async function subscribeUser() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: '<YOUR_VAPID_PUBLIC_KEY>'
  });
  
  // Save subscription to server
  await fetch('/api/save-subscription', {
    method: 'POST',
    body: JSON.stringify(sub),
    headers: { 'Content-Type': 'application/json' }
  });
  
  console.log('Subscribed for notifications!');
}

// Call this function on wallet load
subscribeUser().catch(console.error);
