import { Router } from 'express';
import {
  createClient,
  deleteClient,
  getClient,
  listClients,
  updateClient,
} from '../controllers/clientController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', authorize('ADMIN', 'ATENDENTE'), createClient);
router.put('/:id', authorize('ADMIN', 'ATENDENTE'), updateClient);
router.delete('/:id', authorize('ADMIN'), deleteClient);

export default router;
