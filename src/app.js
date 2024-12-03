const express = require('express')
const passport = require('./config/passport')
const ordersRouter = require('./routes/orders')
const bookingsRouter = require('./routes/bookings')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/users')
const routesRouter = require('./routes/routes')

const app = express()

app.use(express.json())
app.use(passport.initialize())

// API 路由
app.use('/api/auth', authRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/users', userRouter)
app.use('/api/routes', routesRouter)

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: 500,
    message: err.message || '服務器錯誤'
  })
})

module.exports = app