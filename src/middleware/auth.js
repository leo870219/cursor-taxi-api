const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = async (req, res, next) => {
  console.log('Auth middleware called');
  console.log('Headers:', req.headers);
  
  try {
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header');
      return res.status(401).json({
        code: 401,
        message: '未提供認證令牌'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    console.log('Querying user from database');
    const [users] = await db.query(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [decoded.id]
    );
    console.log('Database response:', users);

    if (!users.length) {
      console.log('No user found');
      throw new Error('找不到用戶');
    }

    console.log('User found:', users[0]);
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      code: 401,
      message: '認證失敗'
    });
  }
};

module.exports = {
  auth
};