const db = require('../config/db');
const { generateOrderNo } = require('../utils/orderUtils');

const createBooking = async (req, res) => {
  try {
    const { 
      passenger_name, 
      passenger_phone, 
      pickup_address, 
      dropoff_address,
      pickup_time,
      notes
    } = req.body;

    console.log('Request body:', req.body);

    // 驗證必填欄位
    if (!passenger_name || !passenger_phone || !pickup_address || !dropoff_address || !pickup_time) {
      return res.status(400).json({
        code: 400,
        message: '所有欄位都是必填的'
      });
    }

    // 驗證手機號碼格式
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(passenger_phone)) {
      return res.status(400).json({
        code: 400,
        message: '請輸入正確的手機號碼格式'
      });
    }

    // 生成訂單編號
    const order_no = await generateOrderNo();

    // 創建訂單
    const [result] = await db.query(
      `INSERT INTO orders (
        order_no, 
        customer_id,
        passenger_name, 
        passenger_phone, 
        pickup_address, 
        dropoff_address,
        pickup_time,
        notes,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        order_no, 
        req.user.id,
        passenger_name, 
        passenger_phone, 
        pickup_address, 
        dropoff_address,
        pickup_time,
        notes || null,
      ]
    );

    res.json({
      code: 200,
      message: '預約成功',
      data: {
        id: result.insertId,
        order_no
      }
    });
  } catch (error) {
    console.error('創建訂單失敗：', error);
    res.status(500).json({
      code: 500,
      message: error.message || '創建訂單失敗'
    });
  }
};

module.exports = {
  createBooking
};