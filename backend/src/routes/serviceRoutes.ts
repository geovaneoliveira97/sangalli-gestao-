import { Router } from 'express';
import {
  createService,
  deleteService,
  getService,
  listServices,
  updateService,
} from '../controllers/serviceController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', authorize('ADMIN'), createService);
router.put('/:id', authorize('ADMIN'), updateService);
router.delete('/:id', authorize('ADMIN'), deleteService);

export default router;
