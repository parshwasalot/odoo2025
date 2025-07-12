import { Router } from 'express';
import { 
  createSwap,
  getUserSwaps,
  acceptSwap,
  rejectSwap,
  completeSwap
} from '../controllers/swap.controller';
import { authenticate } from '../middleware/auth';
import { validateSwapRequest } from '../middleware/swapValidation';

const router = Router();

router.post('/', authenticate, validateSwapRequest, createSwap);
router.get('/', authenticate, getUserSwaps);
router.put('/:id/accept', authenticate, acceptSwap);
router.put('/:id/reject', authenticate, rejectSwap);
router.put('/:id/complete', authenticate, completeSwap);

export default router;
