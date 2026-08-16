import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import clientRoutes from './clientRoutes';
import vehicleRoutes from './vehicleRoutes';
import serviceRoutes from './serviceRoutes';
import partRoutes from './partRoutes';
import workOrderRoutes from './workOrderRoutes';
import publicRoutes from './publicRoutes';
import reportRoutes from './reportRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/clientes', clientRoutes);
router.use('/veiculos', vehicleRoutes);
router.use('/servicos', serviceRoutes);
router.use('/pecas', partRoutes);
router.use('/ordens', workOrderRoutes);
router.use('/acompanhar', publicRoutes);
router.use('/relatorios', reportRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
