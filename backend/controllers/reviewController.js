const { getPool } = require('../config/db');

exports.getReviews = async (req, res) => {
  const pool = getPool();
  const lang = req.query.lang || 'en';

  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE language = ? ORDER BY created_at DESC', [lang]);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ message: 'Server error retrieving client reviews.' });
  }
};

exports.createReview = async (req, res) => {
  const { name, company, rating, review_text, media_type, media_url, language } = req.body;
  const pool = getPool();

  try {
    if (!name || !review_text) {
      return res.status(400).json({ message: 'Client name and review text are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (name, company, rating, review_text, media_type, media_url, language) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, company || '', rating || 5, review_text, media_type || 'none', media_url || '', language || 'en']
    );

    return res.status(201).json({
      message: 'Review created successfully.',
      reviewId: result.insertId
    });
  } catch (err) {
    console.error('Error creating review:', err);
    return res.status(500).json({ message: 'Server error saving review.' });
  }
};

exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { name, company, rating, review_text, media_type, media_url, language } = req.body;
  const pool = getPool();

  try {
    if (!name || !review_text) {
      return res.status(400).json({ message: 'Client name and review text are required.' });
    }

    const [result] = await pool.query(
      'UPDATE reviews SET name = ?, company = ?, rating = ?, review_text = ?, media_type = ?, media_url = ?, language = ? WHERE id = ?',
      [name, company || '', rating || 5, review_text, media_type || 'none', media_url || '', language || 'en', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    return res.json({ message: 'Review updated successfully.' });
  } catch (err) {
    console.error('Error updating review:', err);
    return res.status(500).json({ message: 'Server error updating review.' });
  }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    return res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ message: 'Server error deleting review.' });
  }
};
