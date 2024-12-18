require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');

async function initDatabase() {
  let connection;
  try {
    console.log('開始初始化資料庫...');
    console.log('資料庫配置:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    // 創建資料庫連接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT),
      ssl: {
        rejectUnauthorized: false
      },
      multipleStatements: true  // 允許執行多條 SQL 語句
    });

    // 讀取並執行 SQL 文件
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    console.log('執行 SQL 腳本...');
    await connection.query(sql);
    console.log('資料庫初始化成功！');

  } catch (error) {
    console.error('資料庫初始化失敗：', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 執行初始化
initDatabase()
  .then(() => {
    console.log('資料庫初始化完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('資料庫初始化失敗:', error);
    process.exit(1);
  });