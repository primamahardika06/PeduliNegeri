import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'

const app = express()

// Konfigurasi CORS agar frontend dapat mengakses endpoint
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}))

app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Peduli Negeri berjalan lancar.' })
})

// Auth routes
app.use('/api/auth', authRoutes)

export default app