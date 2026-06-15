const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

const dbName = process.env.DB_NAME || 'nekocustoms_db';
let pool = null;

async function initializeDatabase() {
  try {
    // 1. Establish initial connection without database parameter to create it if missing
    const tempConnection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL host successfully.');
    
    // 2. Create the database if it does not exist
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConnection.end();
    console.log(`Database '${dbName}' verified/created.`);

    // 3. Create the connection pool targeting the database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    // Test the pool connection
    const conn = await pool.getConnection();
    console.log(`Connection pool successfully initialized for database '${dbName}'.`);
    conn.release();
    
    return pool;
  } catch (err) {
    console.error('Database connection failed. Please ensure MySQL is running and check your .env configurations.');
    console.error('Error Details:', err.message);
    throw err;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

module.exports = {
  initializeDatabase,
  getPool
};
