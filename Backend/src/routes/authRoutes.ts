import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  forgotHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  resetHandler,
  signupHandler,
} from '../controllers/authController'
import { requireAuth } from '../middlewares/authMiddleware'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again later.' },
})

const router = Router()

router.post('/signup', authLimiter, signupHandler)
router.post('/login', authLimiter, loginHandler)
router.post('/logout', logoutHandler)
router.get('/me', requireAuth, meHandler)
router.post('/refresh', refreshHandler)
router.post('/forgot-password', authLimiter, forgotHandler)
router.post('/reset-password', authLimiter, resetHandler)

export default router
