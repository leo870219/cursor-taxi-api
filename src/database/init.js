require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');

async function initDatabase() {
  let connection;
  try {
    console.log('開始初始化資料庫...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    // 讀取並執行 SQL 文件
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    await connection.query(sql);

    // 添加管理員用戶（如果需要的話）
    await connection.query(`
      INSERT INTO users (email, name, role, status) 
      VALUES ('admin@example.com', '系統管理員', 'admin', 'active')
    `);

    console.log('資料庫初始化成功！');
  } catch (error) {
    console.error('資料庫初始化失敗：', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
}

initDatabase();