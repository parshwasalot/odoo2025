import { Router } from 'express';
import { 
  createItem, 
  getItems, 
  getItem, 
  updateItem, 
  deleteItem,
  updateItemStatus
} from '../controllers/item.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateItemCreation } from '../middleware/itemValidation';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, upload.array('images', 5), validateItemCreation, createItem);
router.get('/', getItems);
router.get('/:id', getItem);
router.put('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);
router.put('/:id/status', authenticate, requireAdmin, updateItemStatus);

export default router;
