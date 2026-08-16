import { Router } from 'express';
import {
  createPart,
  deletePart,
  getPart,
  listParts,
  updatePart,
} from '../controllers/partController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', listParts);
router.get('/:id', getPart);
router.post('/', authorize('ADMIN'), createPart);
router.put('/:id', authorize('ADMIN'), updatePart);
router.delete('/:id', authorize('ADMIN'), deletePart);

export default router;
