const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./db');

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!users.length) {
      return done(null, false, { message: '找不到該用戶' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return done(null, false, { message: '密碼錯誤' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async function(accessToken, refreshToken, profile, done) {
  console.log('Google strategy callback:', {
    profileId: profile.id,
    email: profile.emails?.[0]?.value,
    name: profile.displayName
  });
  
  try {
    // 檢查用戶是否已存在
    const [users] = await db.query(
      'SELECT * FROM users WHERE google_id = ?',
      [profile.id]
    );
    console.log('Existing user:', users[0] || 'Not found');

    if (users.length > 0) {
      return done(null, users[0]);
    }

    // 創建新用戶
    console.log('Creating new user...');
    const [result] = await db.query(
      `INSERT INTO users (
        email, 
        name, 
        google_id, 
        avatar_url, 
        role
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        profile.emails[0].value,
        profile.displayName,
        profile.id,
        profile.photos[0]?.value,
        'customer'  // 預設為客戶角色
      ]
    );

    const [newUser] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );

    return done(null, newUser[0]);
  } catch (error) {
    console.error('Google strategy error:', error);
    done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;