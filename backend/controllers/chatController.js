const { getPool } = require('../config/db');

exports.getChatHistory = async (req, res) => {
  try {
    const pool = getPool();
    // Get chat history for a specific room or between user and everyone (global chat for now or specific)
    // To keep it simple, we'll implement a global portal chat first, or user-to-user
    const { userId } = req.params; // other user
    const currentUserId = req.user.id;

    const query = `
      SELECT c.*, u.username as sender_name 
      FROM chat_messages c
      JOIN users u ON c.sender_id = u.id
      WHERE (c.sender_id = ? AND c.receiver_id = ?) 
         OR (c.sender_id = ? AND c.receiver_id = ?)
      ORDER BY c.timestamp ASC
      LIMIT 100
    `;
    const [messages] = await pool.query(query, [currentUserId, userId, userId, currentUserId]);
    
    // Mark as read
    await pool.query(
      'UPDATE chat_messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [userId, currentUserId]
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
};

// Global chat (if receiver is null)
exports.getGlobalChat = async (req, res) => {
  try {
    const pool = getPool();
    
    const query = `
      SELECT c.*, u.username as sender_name 
      FROM chat_messages c
      JOIN users u ON c.sender_id = u.id
      WHERE c.receiver_id IS NULL
      ORDER BY c.timestamp ASC
      LIMIT 100
    `;
    const [messages] = await pool.query(query);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching global chat', error: error.message });
  }
};
