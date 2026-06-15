const { getPool } = require('../config/db');

exports.getActiveNotices = async (req, res) => {
  const pool = getPool();
  const lang = req.query.lang || 'en';

  try {
    const query = `
      SELECT id, title, content, type, is_active, expires_at, language, created_at 
      FROM notices 
      WHERE is_active = 1 
        AND language = ?
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.query(query, [lang]);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching active notices:', err);
    return res.status(500).json({ message: 'Server error retrieving active notices.' });
  }
};

exports.getPopupNotice = async (req, res) => {
  const pool = getPool();
  const lang = req.query.lang || 'en';

  try {
    const query = `
      SELECT id, title, content, type, expires_at, language, created_at 
      FROM notices 
      WHERE is_active = 1 
        AND type = 'popup'
        AND language = ?
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [lang]);
    if (rows.length === 0) {
      return res.json(null);
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching popup notice:', err);
    return res.status(500).json({ message: 'Server error retrieving popup notice.' });
  }
};

exports.getAllNotices = async (req, res) => {
  const pool = getPool();
  const lang = req.query.lang;
  
  try {
    let query = 'SELECT * FROM notices';
    const params = [];
    
    if (lang) {
      query += ' WHERE language = ?';
      params.push(lang);
    }
    
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching all notices:', err);
    return res.status(500).json({ message: 'Server error retrieving notices for administration.' });
  }
};

exports.createNotice = async (req, res) => {
  const { title, content, type, is_active, expires_at, language } = req.body;
  const pool = getPool();

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const expiry = expires_at && expires_at.trim() !== '' ? expires_at : null;

    const [result] = await pool.query(
      'INSERT INTO notices (title, content, type, is_active, expires_at, language) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, type || 'regular', is_active !== undefined ? is_active : true, expiry, language || 'en']
    );

    return res.status(201).json({
      message: 'Notice created successfully.',
      noticeId: result.insertId
    });
  } catch (err) {
    console.error('Error creating notice:', err);
    return res.status(500).json({ message: 'Server error creating notice.' });
  }
};

exports.updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, content, type, is_active, expires_at, language } = req.body;
  const pool = getPool();

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    const expiry = expires_at && expires_at.trim() !== '' ? expires_at : null;

    await pool.query(
      'UPDATE notices SET title = ?, content = ?, type = ?, is_active = ?, expires_at = ?, language = ? WHERE id = ?',
      [title, content, type || 'regular', is_active !== undefined ? is_active : true, expiry, language || 'en', id]
    );

    return res.json({ message: 'Notice updated successfully.' });
  } catch (err) {
    console.error('Error updating notice:', err);
    return res.status(500).json({ message: 'Server error updating notice.' });
  }
};

exports.deleteNotice = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const [result] = await pool.query('DELETE FROM notices WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notice not found.' });
    }
    return res.json({ message: 'Notice deleted successfully.' });
  } catch (err) {
    console.error('Error deleting notice:', err);
    return res.status(500).json({ message: 'Server error deleting notice.' });
  }
};
