import { Router } from 'express';
import { getMyProfile, updateMyProfile } from './identity.controller';
import { requireAuth } from '../../shared/api/auth.middleware';

const router = Router();

// Todas las rutas de identity requieren autenticación obligatoria
router.get('/profile/me', requireAuth, getMyProfile);
router.patch('/profile/me', requireAuth, updateMyProfile);

export const identityRoutes = router;