import { Router } from 'express';
import { redeemItem, getPointsHistory, adjustPoints } from '../controllers/points.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validatePointsRedemption } from '../middleware/pointsValidation';

const router = Router();

router.post('/redeem', authenticate, validatePointsRedemption, redeemItem);
router.get('/history', authenticate, getPointsHistory);
router.post('/adjust', authenticate, requireAdmin, adjustPoints);

export default router;
