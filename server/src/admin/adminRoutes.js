import { Router } from 'express';
import {
  getAdminSummary,
  getAdminPresensi,
  getAdminDisposisi,
  createAdminDisposisi,
  getAdminAgenda,
  createAdminAgenda,
  getAdminSettings,
  updateAdminSettings,
  handleAdminVerifyCuti
} from './adminController.js';

const router = Router();

// Routes untuk Administrator BRMP DIY
router.get('/summary', getAdminSummary);
router.get('/presensi-all', getAdminPresensi);
router.get('/disposisi', getAdminDisposisi);
router.post('/disposisi', createAdminDisposisi);
router.get('/agenda', getAdminAgenda);
router.post('/agenda', createAdminAgenda);
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);
router.post('/verify-cuti', handleAdminVerifyCuti);

export default router;
