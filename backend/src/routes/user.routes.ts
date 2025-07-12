import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  createAdmin, 
  getUserActivities, 
  getUserImpact,
  getCommunityImpact,
  getGlobalImpact,
  getUserItems
} from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateProfileUpdate } from '../middleware/validation';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);
router.get('/activities', authenticate, getUserActivities);
router.get('/impact', authenticate, getUserImpact);
router.get('/items', authenticate, getUserItems);
router.post('/admin/create', authenticate, requireAdmin, createAdmin);

// Impact routes
router.get('/impact/community', authenticate, getCommunityImpact);
router.get('/impact/global', authenticate, getGlobalImpact);

export default router;
