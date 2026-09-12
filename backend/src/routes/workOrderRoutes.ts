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
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(authenticate);

router.get('/', listWorkOrders);
router.get('/:id', getWorkOrder);
router.get('/:id/qrcode', getWorkOrderQrCode);

router.post('/', createWorkOrder);
router.put('/:id', updateWorkOrder);
router.delete('/:id', deleteWorkOrder);

router.post('/:id/status', updateWorkOrderStatus);

router.post('/:id/servicos', addWorkOrderService);
router.delete('/:id/servicos/:itemId', removeWorkOrderService);

router.post('/:id/pecas', addWorkOrderPart);
router.delete('/:id/pecas/:itemId', removeWorkOrderPart);

router.post('/:id/pagamentos', addWorkOrderPayment);

router.post('/:id/fotos', upload.single('file'), uploadWorkOrderPhoto);
router.delete('/:id/fotos/:photoId', deleteWorkOrderPhoto);

export default router;
