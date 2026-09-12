import { Router } from 'express';
import {
  createPart,
  deletePart,
  getPart,
  listParts,
  updatePart,
} from '../controllers/partController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', listParts);
router.get('/:id', getPart);
router.post('/', createPart);
router.put('/:id', updatePart);
router.delete('/:id', deletePart);

export default router;
