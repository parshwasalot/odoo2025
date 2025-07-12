import { Router } from 'express';
import { 
  getModerationQueue,
  approveItem,
  rejectItem,
  getPlatformStats,
  getUsers,
  updateUserStatus
} from '../controllers/admin.controller';
import { authenticateAdminPin } from '../middleware/auth';
import { validateItemModeration } from '../middleware/adminValidation';

const router = Router();

// All routes require PIN-based admin authentication
router.use(authenticateAdminPin);

// Item moderation
router.get('/moderation/items', getModerationQueue);
router.put('/moderation/items/:id/approve', validateItemModeration, approveItem);
router.put('/moderation/items/:id/reject', validateItemModeration, rejectItem);

// Platform statistics
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

export default router;
