const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const pool = getPool();
    // Exclude passwords
    const [users] = await pool.query('SELECT id, username, role, created_at, joining_date, competence_level, status, notes FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password and role are required' });
    }

    if (!['admin', 'manager', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const pool = getPool();
    
    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );

    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    // Prevent deleting the main admin
    const [user] = await pool.query('SELECT username FROM users WHERE id = ?', [id]);
    if (user.length > 0 && user[0].username === 'admin') {
      return res.status(400).json({ message: 'Cannot delete the main admin user' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.updateUserRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { joining_date, competence_level, status, notes } = req.body;
    const pool = getPool();
    
    // Check role from request auth context
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Administrator or Manager privilege required.' });
    }

    await pool.query(
      `UPDATE users SET 
        joining_date = ?, 
        competence_level = ?, 
        status = ?, 
        notes = ? 
      WHERE id = ?`,
      [joining_date || null, competence_level || 'Intermediate', status || 'Active', notes || null, id]
    );
    
    res.json({ message: 'Staff record updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff record', error: error.message });
  }
};

exports.createStaffReview = async (req, res) => {
  try {
    const { id } = req.params; // staff_id
    const { rating, review_text } = req.body;
    const reviewer_id = req.user.id;
    const pool = getPool();

    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Administrator or Manager privilege required.' });
    }

    if (!review_text) {
      return res.status(400).json({ message: 'Review feedback text is required.' });
    }
    
    await pool.query(
      `INSERT INTO staff_reviews (staff_id, reviewer_id, rating, review_text) VALUES (?, ?, ?, ?)`,
      [id, reviewer_id, rating || 5, review_text]
    );
    
    res.status(201).json({ message: 'Performance review submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating performance review', error: error.message });
  }
};

exports.getStaffReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && String(req.user.id) !== String(id)) {
      return res.status(403).json({ message: 'Access denied. You can only view your own reviews.' });
    }
    
    const [rows] = await pool.query(
      `SELECT r.*, u.username as reviewer_username 
       FROM staff_reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.staff_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance reviews', error: error.message });
  }
};
