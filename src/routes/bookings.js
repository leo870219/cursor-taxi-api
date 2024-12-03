const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

// 創建預約
router.post('/', auth, createBooking);

module.exports = router;