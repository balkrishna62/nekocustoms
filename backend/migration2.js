const { getPool, initializeDatabase } = require('./config/db');

async function runMigration() {
  await initializeDatabase();
  const pool = getPool();

  try {
    console.log('Running database migration for tasks...');
    
    // Add new columns
    const alterQuery = `
      ALTER TABLE tasks 
      ADD COLUMN priority_rank ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      ADD COLUMN deadline DATETIME,
      ADD COLUMN fee_paid DECIMAL(10, 2) DEFAULT 0.00,
      ADD COLUMN goods_details TEXT,
      ADD COLUMN contact_number VARCHAR(50),
      MODIFY COLUMN status ENUM('pending', 'planned', 'ongoing', 'in_progress', 'pending_approval', 'completed') DEFAULT 'planned'
    `;
    
    try {
      await pool.query(alterQuery);
      console.log('Added new columns to tasks table and updated status enum.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Columns already exist in tasks table.');
      } else {
        throw e;
      }
    }

    // Migrate old statuses to new statuses if needed
    await pool.query("UPDATE tasks SET status = 'planned' WHERE status = 'pending'");
    await pool.query("UPDATE tasks SET status = 'ongoing' WHERE status = 'in_progress'");

    // Optional: After migration, we could restrict the ENUM to only the new ones, 
    // but leaving the old ones in the definition doesn't hurt and prevents errors during update.
    await pool.query(`
      ALTER TABLE tasks
      MODIFY COLUMN status ENUM('planned', 'ongoing', 'pending_approval', 'completed') DEFAULT 'planned'
    `);
    
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
