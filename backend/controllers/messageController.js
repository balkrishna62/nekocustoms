const { getPool } = require('../config/db');
const webpush = require('web-push');

exports.submitMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const pool = getPool();

  try {
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required fields.' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || '', subject, message]
    );

    // Dispatch Push Notification to all subscribed admins
    try {
      const [subs] = await pool.query('SELECT * FROM push_subscriptions');
      const payload = JSON.stringify({
        title: 'New Contact Inquiry',
        body: `${name} has sent a new message regarding "${subject}".`
      });

      subs.forEach(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        webpush.sendNotification(pushSubscription, payload).catch(e => {
          console.warn('Push notification failed for a subscriber:', e.statusCode);
          // If 410 Gone or 404 Not Found, we should ideally delete the subscription from DB
          if (e.statusCode === 410 || e.statusCode === 404) {
             pool.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]).catch(console.error);
          }
        });
      });
    } catch (pushErr) {
      console.error('Failed to dispatch push notifications:', pushErr);
    }

    return res.status(201).json({ message: 'Your message has been sent successfully. We will contact you soon.' });
  } catch (err) {
    console.error('Error submitting message:', err);
    return res.status(500).json({ message: 'Server error processing your message.' });
  }
};

exports.getMessages = async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error('Error retrieving messages:', err);
    return res.status(500).json({ message: 'Server error fetching contact messages.' });
  }
};

exports.updateMessageStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'read' or 'unread'
  const pool = getPool();

  try {
    if (!status || !['read', 'unread'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "read" or "unread".' });
    }

    const [result] = await pool.query(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    return res.json({ message: `Message status updated to ${status}.` });
  } catch (err) {
    console.error('Error updating message status:', err);
    return res.status(500).json({ message: 'Server error updating message status.' });
  }
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    return res.json({ message: 'Message deleted successfully.' });
  } catch (err) {
    console.error('Error deleting message:', err);
    return res.status(500).json({ message: 'Server error deleting message.' });
  }
};

exports.getUnreadCount = async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS count FROM contact_messages WHERE status = 'unread'");
    return res.json({ unread: rows[0].count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
