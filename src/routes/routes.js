const express = require('express');
const router = express.Router();
const { getHotRoutes } = require('../controllers/routeController');

// 獲取熱門路線
router.get('/hot', getHotRoutes);

module.exports = router;