import { Router } from 'express';
import {
  addWorkOrderPart,
  addWorkOrderPayment,
  addWorkOrderService,
  createWorkOrder,
  deleteWorkOrder,
  getWorkOrder,
  listWorkOrders,
  removeWorkOrderPart,
  removeWorkOrderService,
  updateWorkOrder,
  updateWorkOrderStatus,
} from '../controllers/workOrderController';
import { deleteWorkOrderPhoto, uploadWorkOrderPhoto } from '../controllers/photoController';
import { getWorkOrderQrCode } from '../controllers/qrCodeController';
import { authenticate, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(authenticate);

router.get('/', listWorkOrders);
router.get('/:id', getWorkOrder);
router.get('/:id/qrcode', getWorkOrderQrCode);

router.post('/', authorize('ADMIN', 'ATENDENTE'), createWorkOrder);
router.put('/:id', authorize('ADMIN', 'ATENDENTE', 'MECANICO'), updateWorkOrder);
router.delete('/:id', authorize('ADMIN'), deleteWorkOrder);

router.post('/:id/status', authorize('ADMIN', 'ATENDENTE', 'MECANICO'), updateWorkOrderStatus);

router.post('/:id/servicos', authorize('ADMIN', 'ATENDENTE', 'MECANICO'), addWorkOrderService);
router.delete('/:id/servicos/:itemId', authorize('ADMIN', 'ATENDENTE'), removeWorkOrderService);

router.post('/:id/pecas', authorize('ADMIN', 'ATENDENTE'), addWorkOrderPart);
router.delete('/:id/pecas/:itemId', authorize('ADMIN', 'ATENDENTE'), removeWorkOrderPart);

router.post('/:id/pagamentos', authorize('ADMIN', 'ATENDENTE'), addWorkOrderPayment);

router.post(
  '/:id/fotos',
  authorize('ADMIN', 'ATENDENTE', 'MECANICO'),
  upload.single('file'),
  uploadWorkOrderPhoto,
);
router.delete('/:id/fotos/:photoId', authorize('ADMIN', 'ATENDENTE'), deleteWorkOrderPhoto);

export default router;
