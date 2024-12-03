const express = require('express')
const cors = require('cors')
const passport = require('./config/passport')
const ordersRouter = require('./routes/orders')
const bookingsRouter = require('./routes/bookings')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/users')
const routesRouter = require('./routes/routes')

const app = express()

// CORS 配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://cursor-taxi-web.vercel.app']
    : ['http://localhost:5173'],
  credentials: true
}))

app.use(express.json())
app.use(passport.initialize())

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'Taxi API is running',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/orders',
      '/api/bookings',
      '/api/users',
      '/api/routes'
    ]
  })
})

// API 路由
app.use('/api/auth', authRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/users', userRouter)
app.use('/api/routes', routesRouter)

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '找不到該路徑'
  })
})

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: 500,
    message: err.message || '服務器錯誤'
  })
})

module.exports = app