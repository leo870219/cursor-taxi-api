const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');

export default async function handler(req, res) {
  // 檢查是否是 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' });
  }

  // 檢查初始化密鑰（為了安全）
  const initKey = req.headers['x-init-key'];
  if (initKey !== process.env.INIT_KEY) {
    return res.status(401).json({ message: '未授權的訪問' });
  }

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
      multipleStatements: true
    });

    // 讀取 SQL 文件
    const sqlPath = path.join(process.cwd(), 'src', 'database', 'init.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    console.log('執行 SQL 腳本...');
    await connection.query(sql);
    console.log('資料庫初始化成功！');

    res.status(200).json({ message: '資料庫初始化成功' });
  } catch (error) {
    console.error('資料庫初始化失敗：', error);
    res.status(500).json({ 
      message: '資料庫初始化失敗', 
      error: error.message 
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
} 