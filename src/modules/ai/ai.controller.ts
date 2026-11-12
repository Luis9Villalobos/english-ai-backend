import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/api/auth.middleware';
import { generateAITutorResponse } from './ai.service';
import { supabase } from '../../shared/database/supabase';

// POST /api/v1/ai/chat - Enviar mensaje al tutor de IA
export const chatWithAITutor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'El mensaje es obligatorio' });
      return;
    }

    // 1. Obtener el nivel objetivo del perfil del usuario para personalizar la IA
    const { data: profile } = await supabase
      .from('profiles')
      .select('target_level')
      .eq('user_id', userId)
      .single();

    const targetLevel = profile?.target_level || 'A1';

    // 2. Llamar al servicio de IA
    const aiResponse = await generateAITutorResponse(message, targetLevel);

    res.json({
      success: true,
      user_message: message,
      ai_response: aiResponse,
    });
  } catch (err) {
    console.error('Error en chatWithAITutor:', err);
    res.status(500).json({ error: 'Error interno al procesar la respuesta de la IA' });
  }
};