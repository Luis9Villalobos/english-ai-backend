import { Router } from 'express';
import { chatWithAITutor } from './ai.controller';
import { requireAuth } from '../../shared/api/auth.middleware';

const router = Router();

// Ruta protegida para chatear con la IA
router.post('/ai/chat', requireAuth, chatWithAITutor);

export const aiRoutes = router;