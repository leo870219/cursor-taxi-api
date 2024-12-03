const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, googleCallback, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 一般註冊和登入
router.post('/register', register);
router.post('/login', login);

// Google OAuth 路由
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

// Google OAuth 回調
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login?error=google_failed'
  }),
  googleCallback
);

// 獲取當前用戶資訊
router.get('/me', auth, getCurrentUser);

module.exports = router;