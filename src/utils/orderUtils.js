const db = require('../config/db');

const generateOrderNo = async () => {
  const date = new Date();
  const prefix = 'ORD';
  const dateStr = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  
  // 獲取當天最大訂單號
  const [rows] = await db.query(
    "SELECT order_no FROM orders WHERE order_no LIKE ? ORDER BY order_no DESC LIMIT 1",
    [`${prefix}${dateStr}%`]
  );

  let sequence = '001';
  if (rows.length > 0) {
    const lastNo = rows[0].order_no;
    const lastSequence = parseInt(lastNo.slice(-3));
    sequence = String(lastSequence + 1).padStart(3, '0');
  }

  return `${prefix}${dateStr}${sequence}`;
};

module.exports = {
  generateOrderNo
};