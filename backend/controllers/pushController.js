const { getPool } = require('../config/db');

// GET /api/admin/push/vapid-public-key
const getVapidPublicKey = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// POST /api/admin/push/subscribe
const subscribe = async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }

    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys ? subscription.keys.p256dh : '';
    const auth = subscription.keys ? subscription.keys.auth : '';

    const pool = getPool();
    
    // UPSERT: since endpoint is UNIQUE, we can insert or update (ignoring duplicates is fine here or replace)
    // MySQL INSERT IGNORE is simpler since we just want it to exist
    await pool.query(
      'INSERT IGNORE INTO push_subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)',
      [endpoint, p256dh, auth]
    );

    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (err) {
    console.error('Error saving push subscription:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getVapidPublicKey,
  subscribe
};
