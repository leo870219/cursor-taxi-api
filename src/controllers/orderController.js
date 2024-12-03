const db = require('../config/db');
const { generateOrderNo } = require('../utils/orderUtils');

const getOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      orderNo = '', 
      status = '', 
      role = 'customer', 
      userId 
    } = req.query;

    // 构建基础查询
    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        d.name as driver_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN users d ON o.driver_id = d.id
      WHERE 1=1
    `;
    
    const params = [];

    // 根据角色和用户ID筛选
    if (role === 'customer' && userId) {
      query += ' AND o.customer_id = ?';
      params.push(userId);
    } else if (role === 'driver' && userId) {
      query += ' AND o.driver_id = ?';
      params.push(userId);
    }

    // 订单号筛选
    if (orderNo) {
      query += ' AND o.order_no LIKE ?';
      params.push(`%${orderNo}%`);
    }

    // 状态筛选
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    // 计算总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM (${query}) as temp`,
      params
    );
    const total = countResult[0].total;

    // 添加分页
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    const offset = (Number(page) - 1) * Number(pageSize);
    params.push(Number(pageSize), offset);

    // 执行查询
    const [orders] = await db.query(query, params);

    res.json({
      code: 200,
      message: '獲取訂單列表成功',
      data: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        list: orders
      }
    });
  } catch (error) {
    console.error('獲取訂單列表失敗：', error);
    res.status(500).json({
      code: 500,
      message: error.message || '獲取訂單列表失敗'
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const { 
      customer_id,
      passenger_name, 
      passenger_phone, 
      pickup_address, 
      dropoff_address,
      pickup_time,
      notes
    } = req.body;

    // 验证必填字段
    if (!passenger_name || !passenger_phone || !pickup_address || !dropoff_address || !pickup_time) {
      return res.status(400).json({
        code: 400,
        message: '所有欄位都是必填的'
      });
    }

    // 生成订单号
    const order_no = await generateOrderNo();

    // 创建订单
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
      [order_no, customer_id, passenger_name, passenger_phone, pickup_address, dropoff_address, pickup_time, notes]
    );

    res.status(201).json({
      code: 201,
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
  getOrders,
  createOrder
};