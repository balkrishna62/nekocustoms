const { getPool } = require('../config/db');

exports.getSettings = async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');
    
    // Convert array of key-value pairs into a clean object
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ message: 'Server error retrieving site configurations.' });
  }
};

exports.updateSettings = async (req, res) => {
  const settings = req.body;
  const pool = getPool();

  try {
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Invalid settings payload.' });
    }

    // Update each configuration key-value pair in a transaction or sequential queries
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      const stringVal = value === null || value === undefined ? '' : String(value);
      return pool.query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, stringVal, stringVal]
      );
    });

    await Promise.all(updatePromises);
    return res.json({ message: 'Site settings updated successfully.' });
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ message: 'Server error updating site configurations.' });
  }
};
