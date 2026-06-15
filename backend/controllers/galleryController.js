const { getPool } = require('../config/db');

exports.getGallery = async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching gallery items:', err);
    return res.status(500).json({ message: 'Server error retrieving gallery.' });
  }
};

exports.createGalleryItem = async (req, res) => {
  const { title, description, image_url } = req.body;
  const pool = getPool();

  try {
    if (!title || !image_url) {
      return res.status(400).json({ message: 'Title and image URL are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO gallery (title, description, image_url) VALUES (?, ?, ?)',
      [title, description || '', image_url]
    );

    return res.status(201).json({
      message: 'Gallery item added successfully.',
      itemId: result.insertId
    });
  } catch (err) {
    console.error('Error creating gallery item:', err);
    return res.status(500).json({ message: 'Server error saving gallery item.' });
  }
};

exports.updateGalleryItem = async (req, res) => {
  const { id } = req.params;
  const { title, description, image_url } = req.body;
  const pool = getPool();

  try {
    if (!title || !image_url) {
      return res.status(400).json({ message: 'Title and image URL are required.' });
    }

    const [result] = await pool.query(
      'UPDATE gallery SET title = ?, description = ?, image_url = ? WHERE id = ?',
      [title, description || '', image_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gallery item not found.' });
    }

    return res.json({ message: 'Gallery item updated successfully.' });
  } catch (err) {
    console.error('Error updating gallery item:', err);
    return res.status(500).json({ message: 'Server error updating gallery item.' });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const [result] = await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gallery item not found.' });
    }
    return res.json({ message: 'Gallery item deleted successfully.' });
  } catch (err) {
    console.error('Error deleting gallery item:', err);
    return res.status(500).json({ message: 'Server error deleting gallery item.' });
  }
};
