import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

router.get('/', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  })
})

export default router
