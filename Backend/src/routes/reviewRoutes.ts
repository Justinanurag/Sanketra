import { Router } from 'express';
import { submitReview } from '../controllers/reviewController';

const router = Router();

router.post('/:id', submitReview);

export default router;
