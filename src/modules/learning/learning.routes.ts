import { Router } from 'express';
import { startSession, endSession } from './learning.controller';
import { requireAuth } from '../../shared/api/auth.middleware';

const router = Router();

// Todas las rutas de aprendizaje requieren autenticación
router.post('/learning/sessions/start', requireAuth, startSession);
router.patch('/learning/sessions/:id/end', requireAuth, endSession);

export const learningRoutes = router;