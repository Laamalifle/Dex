import express from 'express';
import webpush from 'web-push';
import { Server } from 'stellar-sdk';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const server = new Server('https://horizon.stellar.org');
let subscriptions = [];

// ====== 🔑 VAPID KEYS (bedel kuwana kuwaaga) ======
webpush.setVapidDetails(
  'mailto:you@laamwallet.com',
  'BOH3Yt...<YOUR_PUBLIC_KEY>...',
  'D1l7U...<YOUR_PRIVATE_KEY>...'
);

// ====== 💾 Save subscription endpoint ======
app.post('/api/save-subscription', (req, res) => {
  subscriptions.push(req.body);
  res.sendStatus(201);
});

// ====== 👛 Wallet to monitor ======
const WALLET_ADDRESS = 'GAL4ECDAXNBMJYFCWIJ32HKVIRLCNEXY664CAZYI3EINQWPLXTMEPR64';

// ====== 📡 Stream Stellar transactions ======
server.transactions()
  .forAccount(WALLET_ADDRESS)
  .cursor('now')
  .stream({
    onmessage: async (tx) => {
      const ops = await server.operations().forTransaction(tx.id).call();
      ops.records.forEach(op => {
        if (op.type === 'payment' && op.to === WALLET_ADDRESS) {
          const title = '💰 Laam Wallet Deposit';
          const body = `${op.amount} ${op.asset_code || 'XLM'} deposited successfully`;
          const payload = JSON.stringify({ title, body, url: '/dashboard' });

          subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
          });
        }
      });
    }
  });

app.listen(3000, () => console.log('🚀 Laam Wallet Notification Server running on port 3000'));
