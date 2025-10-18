import express from 'express';
import webpush from 'web-push';
import { Server } from 'stellar-sdk';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ====== MongoDB ======
mongoose.connect(process.env.MONGODB_URI);
const subscriptionSchema = new mongoose.Schema({ endpoint: String, keys: Object });
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ====== Web Push ======
webpush.setVapidDetails(
  `mailto:${process.env.MAILTO}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ====== Save subscription endpoint ======
app.post('/api/save-subscription', async (req, res) => {
  try {
    const sub = new Subscription(req.body);
    await sub.save();
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ====== Stellar ======
const server = new Server('https://horizon.stellar.org');
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;

server.transactions()
  .forAccount(WALLET_ADDRESS)
  .cursor('now')
  .stream({
    onmessage: async (tx) => {
      try {
        const ops = await server.operations().forTransaction(tx.id).call();
        for (const op of ops.records) {
          if (op.type === 'payment' && op.to === WALLET_ADDRESS) {
            const title = '💰 Laam Wallet Deposit';
            const body = `${op.amount} ${op.asset_code || 'XLM'} deposited successfully`;
            const payload = JSON.stringify({ title, body, url: '/dashboard' });

            const subs = await Subscription.find();
            for (const sub of subs) {
              webpush.sendNotification(sub, payload).catch(err => {
                console.error('Push error, removing subscription:', err);
                Subscription.deleteOne({ _id: sub._id }).catch(console.error);
              });
            }
          }
        }
      } catch (err) {
        console.error('Stellar stream error:', err);
      }
    },
    onerror: err => console.error('Stellar stream connection error:', err)
  });

// ====== Start server ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Laam Wallet Notification Server running on port ${PORT}`));
