import { Router } from 'express';
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from '../controllers/vehicleController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', listVehicles);
router.get('/:id', getVehicle);
router.post('/', authorize('ADMIN', 'ATENDENTE'), createVehicle);
router.put('/:id', authorize('ADMIN', 'ATENDENTE'), updateVehicle);
router.delete('/:id', authorize('ADMIN'), deleteVehicle);

export default router;
