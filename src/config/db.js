const mysql = require('mysql2/promise');
require('dotenv').config();  // 確保已安裝 dotenv

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,  // 從 .env 讀取密碼
  database: process.env.DB_DATABASE || 'taxi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 測試連接但不終止程序
pool.getConnection()
  .then(connection => {
    console.log('資料庫連接成功');
    connection.release();
  })
  .catch(err => {
    console.error('資料庫連接失敗:', err);
  });

module.exports = pool;