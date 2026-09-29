import { Router } from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { extractSafetyReportHandler, MAX_UPLOAD_BYTES, uploadSafetyReport } from '../controllers/safetyUploadController'
import { requireAuth } from '../middlewares/authMiddleware'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
})

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many upload attempts. Try again later.' },
})

const router = Router()

router.post('/upload', requireAuth, limiter, (req, res, next) => {
  upload.single('file')(req, res, (error: unknown) => {
    if (error) {
      const limited = typeof error === 'object' && error !== null && 'code' in error && error.code === 'LIMIT_FILE_SIZE'
      res.status(400).json({
        success: false,
        message: limited ? 'The file must be 8 MB or smaller' : 'The file could not be uploaded',
      })
      return
    }
    void uploadSafetyReport(req, res, next)
  })
})

router.post('/extract', requireAuth, limiter, extractSafetyReportHandler)

export default router
