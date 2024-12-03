const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 一般註冊
const register = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // 驗證必填欄位
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        code: 400,
        message: '所有欄位都是必填的'
      });
    }

    // 檢查郵箱是否已存在
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length) {
      return res.status(400).json({
        code: 400,
        message: '此郵箱已被註冊'
      });
    }

    // 密碼加密
    const hashedPassword = await bcrypt.hash(password, 12);

    // 創建用戶
    const [result] = await db.query(
      `INSERT INTO users (email, password, name, phone, role)
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, phone, role]
    );

    // 如果是司機，需要額外的驗證資訊
    if (role === 'driver') {
      const { license_number, vehicle_number, vehicle_type } = req.body;
      
      if (!license_number || !vehicle_number || !vehicle_type) {
        return res.status(400).json({
          code: 400,
          message: '司機需要提供完整的車輛資訊'
        });
      }

      await db.query(
        `INSERT INTO driver_profiles (user_id, license_number, vehicle_number, vehicle_type)
         VALUES (?, ?, ?, ?)`,
        [result.insertId, license_number, vehicle_number, vehicle_type]
      );
    }

    // 生成 JWT
    const [newUser] = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [result.insertId]
    );

    const token = generateToken(newUser[0]);

    res.status(201).json({
      code: 201,
      message: '註冊成功',
      data: {
        token,
        user: newUser[0]
      }
    });
  } catch (error) {
    console.error('註冊失敗：', error);
    res.status(500).json({
      code: 500,
      message: error.message || '註冊失敗'
    });
  }
};

// 一般登入
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 驗證必填欄位
    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        message: '請提供郵箱和密碼'
      });
    }

    // 查找用戶
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return res.status(401).json({
        code: 401,
        message: '郵箱或密碼錯誤'
      });
    }

    const user = users[0];

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '郵箱或密碼錯誤'
      });
    }

    // 生成 JWT
    const token = generateToken(user);

    res.json({
      code: 200,
      message: '登入成功',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('登入失敗：', error);
    res.status(500).json({
      code: 500,
      message: error.message || '登入失敗'
    });
  }
};

// Google 登入回調
const googleCallback = async (req, res) => {
  console.log('Google callback controller starting...');
  
  try {
    if (!req.user) {
      console.error('No user data in request');
      throw new Error('No user data from Google');
    }

    const token = generateToken(req.user);
    console.log('Generated token:', token);
    console.log('User data:', req.user);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
    
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=google_login_failed`);
  }
};

// 獲取當前用戶資訊
const getCurrentUser = async (req, res) => {
  console.log('getCurrentUser called');
  console.log('User from request:', req.user);
  
  try {
    console.log('Querying database for user:', req.user.id);
    const [users] = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [req.user.id]
    );
    console.log('Database response:', users);

    if (!users.length) {
      console.log('No user found');
      return res.status(404).json({
        code: 404,
        message: '找不到用戶'
      });
    }

    console.log('Sending user data:', users[0]);
    res.json({
      code: 200,
      data: users[0]
    });
  } catch (error) {
    console.error('獲取用戶資訊失敗：', error);
    res.status(500).json({
      code: 500,
      message: error.message || '獲取用戶資訊失敗'
    });
  }
};

module.exports = {
  register,
  login,
  googleCallback,
  getCurrentUser
};