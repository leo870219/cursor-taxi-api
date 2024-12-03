const db = require('../config/db');

const getHotRoutes = async (req, res) => {
  try {
    const [routes] = await db.query(
      'SELECT * FROM routes WHERE is_hot = true ORDER BY created_at DESC'
    );

    res.json({
      code: 200,
      data: routes
    });
  } catch (error) {
    console.error('獲取熱門路線失敗：', error);
    res.status(500).json({
      code: 500,
      message: error.message || '獲取熱門路線失敗'
    });
  }
};

module.exports = {
  getHotRoutes
};