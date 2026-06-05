require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const crypto = require('crypto');
const path = require('path');
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');

const app = express();

const PORT = process.env.PORT || 10000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const NODE_ENV = process.env.NODE_ENV || 'development';
const HAS_RAZORPAY = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

app.use(cors({
  origin: FRONTEND_URL === '*' ? true : FRONTEND_URL.split(',').map((u) => u.trim()),
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'The Vortex is awake.',
    razorpay: HAS_RAZORPAY,
  });
});

let razorpay = null;
if (HAS_RAZORPAY) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('[vortex] Razorpay keys missing. /api/create-order and /api/verify-payment will return 503.');
}

app.post('/api/create-order', async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ error: 'Razorpay is not configured on the server.' });
  }
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'A valid positive `amount` is required.' });
    }
    const order = await razorpay.orders.create({
      amount: Math.round(amount) * 100,
      currency: 'INR',
      receipt: `vortex_receipt_${Date.now()}`,
    });
    res.json(order);
  } catch (error) {
    console.error('[vortex] create-order error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

app.post('/api/verify-payment', (req, res) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ error: 'Razorpay is not configured on the server.' });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields.' });
  }
  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (razorpay_signature === expectedSign) {
    return res.status(200).json({ message: 'Payment verified successfully', verified: true });
  }
  return res.status(400).json({ message: 'Invalid signature sent!', verified: false });
});

const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get(/^\/(?!api\/).*/, (req, res, next) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use((err, req, res, _next) => {
  console.error('[vortex] unhandled error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[vortex] backend active on 0.0.0.0:${PORT} (env=${NODE_ENV})`);
});
