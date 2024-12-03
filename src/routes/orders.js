const express = require('express')
const router = express.Router()
const { getOrders, createOrder } = require('../controllers/orderController')
const { auth } = require('../middleware/auth')

// 获取订单列表
router.get('/', auth, getOrders)

// 创建订单
router.post('/', auth, createOrder)

module.exports = router