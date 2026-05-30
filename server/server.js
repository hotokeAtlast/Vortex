require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');

const app = express();


app.use(cors());
app.use(express.json());

// --- HEALTH CHECK FOR RENDER CRON JOB ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'The Vortex is awake.' });
});

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/create-order', async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `vortex_receipt_${Math.floor(Math.random() * 10000)}`,
        };

        const order = await razorpay.orders.create(options);

        if(!order) return res.status(500).send('Some error occurred while creating order');
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

const crypto = require('crypto');

// ... existing code ...

app.post('/api/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // The logic to verify the signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    
    // Hash it using your Secret Key
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

    if (razorpay_signature === expectedSign) {
        // Payment is 100% authentic
        return res.status(200).json({ message: "Payment verified successfully", verified: true });
    } else {
        // Someone is trying to spoof the system
        return res.status(400).json({ message: "Invalid signature sent!", verified: false });
    }
}); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Vortex backend active on port ${PORT}`));