const { getPool } = require('../config/db');

exports.getTasks = async (req, res) => {
  try {
    const pool = getPool();
    
    // Fetch tasks along with assigned and creator usernames
    const query = `
      SELECT t.*, u1.username as assigned_to_username, u2.username as created_by_username
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      ORDER BY t.created_at DESC
    `;
    const [tasks] = await pool.query(query);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

exports.getTasksByUser = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id; // from auth middleware
    
    const query = `
      SELECT t.*, u1.username as assigned_to_username, u2.username as created_by_username
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.assigned_to = ? OR t.created_by = ?
      ORDER BY t.created_at DESC
    `;
    const [tasks] = await pool.query(query, [userId, userId]);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, priority_rank, deadline, fee_paid, goods_details, contact_number } = req.body;
    const created_by = req.user.id;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO tasks 
      (title, description, assigned_to, created_by, priority_rank, deadline, fee_paid, goods_details, contact_number) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        description || null, 
        assigned_to || null, 
        created_by,
        priority_rank || 'medium',
        deadline || null,
        fee_paid || 0.00,
        goods_details || null,
        contact_number || null
      ]
    );

    res.status(201).json({ message: 'Task created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;
    const userRole = req.user.role;

    // Staff cannot mark as completed directly, it goes to pending_approval
    if (status === 'completed' && userRole === 'staff') {
      status = 'pending_approval';
    }

    if (!['planned', 'ongoing', 'pending_approval', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pool = getPool();
    await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    
    res.json({ message: 'Task status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

exports.updateTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, priority_rank, deadline, fee_paid, goods_details, contact_number } = req.body;
    
    const pool = getPool();
    await pool.query(
      `UPDATE tasks SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        assigned_to = COALESCE(?, assigned_to),
        priority_rank = COALESCE(?, priority_rank),
        deadline = COALESCE(?, deadline),
        fee_paid = COALESCE(?, fee_paid),
        goods_details = COALESCE(?, goods_details),
        contact_number = COALESCE(?, contact_number)
      WHERE id = ?`,
      [title, description, assigned_to, priority_rank, deadline, fee_paid, goods_details, contact_number, id]
    );

    res.json({ message: 'Task details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task details', error: error.message });
  }
};

exports.searchTasks = async (req, res) => {
  try {
    const { query } = req.query;
    const pool = getPool();
    
    const sql = `
      SELECT t.*, u1.username as assigned_to_username, u2.username as created_by_username
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.title LIKE ? OR t.contact_number LIKE ? OR t.goods_details LIKE ?
      ORDER BY t.created_at DESC
    `;
    const searchTerm = `%${query}%`;
    const [tasks] = await pool.query(sql, [searchTerm, searchTerm, searchTerm]);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error searching tasks', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const pool = getPool();
    
    // Remaining works: tasks with status NOT completed
    const [remainingTasks] = await pool.query(
      `SELECT COUNT(*) as count FROM tasks WHERE status != 'completed'`
    );

    // Remaining payment: sum of fee_paid for tasks with status NOT completed
    const [remainingPayment] = await pool.query(
      `SELECT COALESCE(SUM(fee_paid), 0) as total FROM tasks WHERE status != 'completed'`
    );

    // Works done this month: tasks with status 'completed' updated in the current month
    const [completedThisMonth] = await pool.query(
      `SELECT COUNT(*) as count FROM tasks 
       WHERE status = 'completed' 
       AND MONTH(updated_at) = MONTH(CURRENT_DATE()) 
       AND YEAR(updated_at) = YEAR(CURRENT_DATE())`
    );

    // Total fees completed this month
    const [completedFeesThisMonth] = await pool.query(
      `SELECT COALESCE(SUM(fee_paid), 0) as total FROM tasks 
       WHERE status = 'completed' 
       AND MONTH(updated_at) = MONTH(CURRENT_DATE()) 
       AND YEAR(updated_at) = YEAR(CURRENT_DATE())`
    );

    // Total Users
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Unread Public Messages
    const [unreadMessages] = await pool.query("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'");
    
    // Notice announcements
    const [totalNotices] = await pool.query("SELECT COUNT(*) as count FROM notices");

    // Total Blogs
    const [totalBlogs] = await pool.query('SELECT COUNT(*) as count FROM blogs');

    // Total Reviews
    const [totalReviews] = await pool.query('SELECT COUNT(*) as count FROM reviews');

    // Total Gallery Items
    const [totalGalleryItems] = await pool.query('SELECT COUNT(*) as count FROM gallery');

    res.json({
      remainingWorks: remainingTasks[0].count,
      remainingPayment: parseFloat(remainingPayment[0].total),
      completedThisMonth: completedThisMonth[0].count,
      completedFeesThisMonth: parseFloat(completedFeesThisMonth[0].total),
      totalUsers: totalUsers[0].count,
      unreadMessages: unreadMessages[0].count,
      totalNotices: totalNotices[0].count,
      totalBlogs: totalBlogs[0].count,
      totalReviews: totalReviews[0].count,
      totalGalleryItems: totalGalleryItems[0].count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

exports.getStaffWorkload = async (req, res) => {
  try {
    const pool = getPool();
    const userRole = req.user.role;

    // Check permissions - only admin or manager can see workload metrics of all staff
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Administrator or Manager privilege required.' });
    }

    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.role,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'planned' THEN 1 ELSE 0 END) as planned_count,
        SUM(CASE WHEN t.status = 'ongoing' THEN 1 ELSE 0 END) as ongoing_count,
        SUM(CASE WHEN t.status = 'pending_approval' THEN 1 ELSE 0 END) as review_count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN t.status != 'completed' THEN COALESCE(t.fee_paid, 0) ELSE 0 END) as pending_fees,
        SUM(CASE WHEN t.status = 'completed' THEN COALESCE(t.fee_paid, 0) ELSE 0 END) as realized_fees
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      GROUP BY u.id, u.username, u.role
      ORDER BY u.role, u.username
    `;
    const [rows] = await pool.query(query);

    // Convert decimal database fields to numbers
    const formatted = rows.map(r => ({
      ...r,
      pending_fees: parseFloat(r.pending_fees || 0),
      realized_fees: parseFloat(r.realized_fees || 0)
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff workload stats', error: error.message });
  }
};
