import { Router } from 'express';
import { trackWorkOrder } from '../controllers/publicController';

const router = Router();

router.get('/:token', trackWorkOrder);

export default router;
