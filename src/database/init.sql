CREATE TABLE users (
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

CREATE TABLE driver_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  license_number VARCHAR(20) NOT NULL,
  vehicle_number VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE orders (
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

CREATE TABLE routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `from` VARCHAR(255) NOT NULL,
  `to` VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INT NOT NULL COMMENT '預估時間(分鐘)',
  is_hot BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (email, name, role, status) VALUES
('customer@example.com', '測試客戶', 'customer', 'active'),
('driver@example.com', '測試司機', 'driver', 'active');

INSERT INTO driver_profiles (user_id, license_number, vehicle_number, vehicle_type) VALUES
(2, 'DL123456', 'CAR-1234', '轎車');

INSERT INTO orders (
  order_no, 
  customer_id, 
  driver_id, 
  passenger_name, 
  passenger_phone, 
  pickup_address, 
  dropoff_address, 
  pickup_time, 
  notes, 
  status
) VALUES
('ORD001', 1, 2, '張三', '0912345678', '台北車站', '松山機場', '2024-03-20 14:30:00', '需要後車廂空間', 'PENDING'),
('ORD002', 1, 2, '李四', '0923456789', '信義區101', '台北動物園', '2024-03-21 09:00:00', '攜帶寵物', 'ACCEPTED'),
('ORD003', 1, 2, '王五', '0934567890', '西門町', '陽明山', '2024-03-19 16:00:00', NULL, 'COMPLETED');

INSERT INTO routes (`from`, `to`, price, duration, is_hot) VALUES
('台北車站', '松山機場', 350, 30, true),
('台北車站', '桃園機場', 1000, 50, true),
('台北101', '台北車站', 200, 20, true),
('西門町', '南港展覽館', 300, 25, true),
('台北小巨蛋', '陽明山', 450, 40, true);