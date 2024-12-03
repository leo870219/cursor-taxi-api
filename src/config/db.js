const mysql = require('mysql2/promise');
require('dotenv').config();

// 確保 port 是數字類型
const dbPort = parseInt(process.env.DB_PORT) || 3306;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'taxi_db',
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// 測試連接
pool.getConnection()
  .then(connection => {
    console.log('資料庫連接成功');
    connection.release();
  })
  .catch(err => {
    console.error('資料庫連接失敗:', err);
    console.error('連接配置:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: dbPort
    });
  });

module.exports = pool;