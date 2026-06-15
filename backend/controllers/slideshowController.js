const { getPool } = require('../config/db');

exports.getSlides = async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query('SELECT * FROM slideshow ORDER BY order_index ASC, created_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching slideshow slides:', err);
    return res.status(500).json({ message: 'Server error retrieving presentation slides.' });
  }
};

exports.createSlide = async (req, res) => {
  const { title, subtitle, image_url, order_index } = req.body;
  const pool = getPool();

  try {
    if (!title || !image_url) {
      return res.status(400).json({ message: 'Title and background image URL are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO slideshow (title, subtitle, image_url, order_index) VALUES (?, ?, ?, ?)',
      [title, subtitle || '', image_url, order_index || 0]
    );

    return res.status(201).json({
      message: 'Slideshow slide created successfully.',
      slideId: result.insertId
    });
  } catch (err) {
    console.error('Error creating slideshow slide:', err);
    return res.status(500).json({ message: 'Server error saving slide.' });
  }
};

exports.updateSlide = async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, image_url, order_index } = req.body;
  const pool = getPool();

  try {
    if (!title || !image_url) {
      return res.status(400).json({ message: 'Title and background image URL are required.' });
    }

    const [result] = await pool.query(
      'UPDATE slideshow SET title = ?, subtitle = ?, image_url = ?, order_index = ? WHERE id = ?',
      [title, subtitle || '', image_url, order_index || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Slide not found.' });
    }

    return res.json({ message: 'Slide updated successfully.' });
  } catch (err) {
    console.error('Error updating slideshow slide:', err);
    return res.status(500).json({ message: 'Server error updating slide.' });
  }
};

exports.deleteSlide = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const [result] = await pool.query('DELETE FROM slideshow WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Slide not found.' });
    }
    return res.json({ message: 'Slide deleted successfully.' });
  } catch (err) {
    console.error('Error deleting slideshow slide:', err);
    return res.status(500).json({ message: 'Server error deleting slide.' });
  }
};
