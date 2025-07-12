import { Router } from 'express';
import { getProfile, updateProfile, createAdmin } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateProfileUpdate } from '../middleware/validation';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);
router.post('/admin/create', authenticate, requireAdmin, createAdmin);

export default router;
