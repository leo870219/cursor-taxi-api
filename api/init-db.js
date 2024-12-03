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

    // SQL 語句
    const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      role ENUM('customer', 'driver', 'admin') NOT NULL,
      google_id VARCHAR(255),
      avatar_url VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS driver_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      license_number VARCHAR(20) NOT NULL,
      vehicle_number VARCHAR(20) NOT NULL,
      vehicle_type VARCHAR(50) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_no VARCHAR(50) NOT NULL UNIQUE,
      customer_id INT,
      driver_id INT,
      passenger_name VARCHAR(100) NOT NULL,
      passenger_phone VARCHAR(20) NOT NULL,
      pickup_address VARCHAR(255) NOT NULL,
      dropoff_address VARCHAR(255) NOT NULL,
      pickup_time DATETIME NOT NULL,
      notes TEXT,
      status ENUM('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (driver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS routes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`from\` VARCHAR(255) NOT NULL,
      \`to\` VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      duration INT NOT NULL COMMENT '預估時間(分鐘)',
      is_hot BOOLEAN DEFAULT false,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    INSERT IGNORE INTO users (email, name, role, status) VALUES
    ('customer@example.com', '測試客戶', 'customer', 'active'),
    ('driver@example.com', '測試司機', 'driver', 'active');

    INSERT IGNORE INTO driver_profiles (user_id, license_number, vehicle_number, vehicle_type)
    SELECT id, 'DL123456', 'CAR-1234', '轎車'
    FROM users
    WHERE email = 'driver@example.com'
    AND NOT EXISTS (
      SELECT 1 FROM driver_profiles WHERE user_id = users.id
    );

    INSERT IGNORE INTO routes (\`from\`, \`to\`, price, duration, is_hot) VALUES
    ('台北車站', '松山機場', 350, 30, true),
    ('台北車站', '桃園機場', 1000, 50, true),
    ('台北101', '台北車站', 200, 20, true),
    ('西門町', '南港展覽館', 300, 25, true),
    ('台北小巨蛋', '陽明山', 450, 40, true);
    `;
    
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