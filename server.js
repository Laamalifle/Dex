import express from 'express';
import webpush from 'web-push';
import { Server } from 'stellar-sdk';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const server = new Server('https://horizon.stellar.org');
let subscriptions = []; // Save subscriptions here (or DB)

// VAPID keys
webpush.setVapidDetails(
  'mailto:you@laamwallet.com',
  '<YOUR_VAPID_PUBLIC_KEY>',
  '<YOUR_VAPID_PRIVATE_KEY>'
);

// Save subscription endpoint
app.post('/api/save-subscription', (req, res) => {
  subscriptions.push(req.body);
  res.sendStatus(201);
});

// Stellar wallet monitoring (example for one wallet)
const WALLET_ADDRESS = '<USER_LAAM_WALLET_ADDRESS>';

server.transactions()
  .forAccount(WALLET_ADDRESS)
  .cursor('now')
  .stream({ onmessage: async tx => {
    const amount = tx.operations?.[0]?.amount || '0';
    const asset = tx.operations?.[0]?.asset_code || 'LAAM';
    const title = 'Laam Wallet';
    const body = `${amount} ${asset} deposited successfully!`;
    const url = '/dashboard';

    // Send push notification to all subscribers
    subscriptions.forEach(sub => {
      webpush.sendNotification(sub, JSON.stringify({ title, body, url }))
        .catch(err => console.error('Push error:', err));
    });
  }});

app.listen(3000, () => console.log('Server running on port 3000'));
