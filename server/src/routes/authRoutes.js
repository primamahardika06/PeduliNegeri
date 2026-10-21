import { Router } from 'express'
import { register, login, forgotPassword, getAllProfiles } from '../controllers/authController.js'

const router = Router()

// Endpoint registrasi akun
router.post('/register', register)

// Endpoint login (user dan admin)
router.post('/login', login)

// Endpoint lupa password
router.post('/forgot-password', forgotPassword)

// Endpoint untuk admin dashboard melihat seluruh user
router.get('/users', getAllProfiles)

export default router
