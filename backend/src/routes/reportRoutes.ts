import { Router } from 'express';
import { getReports } from '../controllers/reportController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'ATENDENTE'), getReports);

export default router;
