import { Router } from 'express';
import { createReport, getReports, getReportById, analyzeReport } from '../controllers/reportController';

const router = Router();

router.post('/', createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/:id/analyze', analyzeReport);

export default router;
