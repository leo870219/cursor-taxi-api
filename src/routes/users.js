const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const db = require('../config/db');

// 獲取用戶列表
router.get('/', auth, async (req, res) => {
  try {
    const { search, role, status, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    // 構建查詢條件
    let whereClause = '1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // 獲取總數
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 獲取分頁數據
    const [users] = await db.query(
      `SELECT id, email, name, role, status, created_at 
       FROM users 
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    res.json({
      code: 200,
      data: {
        list: users,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('獲取用戶列表失敗：', error);
    res.status(500).json({
      code: 500,
      message: error.message || '獲取用戶列表失敗'
    });
  }
});

// 更新用戶狀態
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用戶狀態失敗：', error);
    res.status(500).json({
      code: 500,
      message: error.message || '更新用戶狀態失敗'
    });
  }
});

module.exports = router;