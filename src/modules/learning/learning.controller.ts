import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/api/auth.middleware';
import { supabase } from '../../shared/database/supabase';

// POST /api/v1/learning/sessions/start - Iniciar una sesión de estudio
export const startSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { mode } = req.body; // 'teacher_write', 'teacher_voice', 'interviewer'

    if (!mode) {
      res.status(400).json({ error: 'El modo de sesión es obligatorio' });
      return;
    }

    // 1. Verificar la suscripción del usuario para validar límites del plan FREE
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription || subscription.status !== 'active') {
      res.status(403).json({ error: 'No se encontró una suscripción activa' });
      return;
    }

    // 2. Si es FREE, verificar cuántos segundos lleva acumulados hoy
    if (subscription.plan_type === 'FREE') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: sessions, error: sessError } = await supabase
        .from('learning_sessions')
        .select('duration_seconds')
        .eq('user_id', userId)
        .gte('started_at', todayStart.toISOString());

      if (!sessError && sessions) {
        const totalSecondsToday = sessions.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
        const MAX_FREE_SECONDS = 30 * 60; // 30 minutos diarios

        if (totalSecondsToday >= MAX_FREE_SECONDS) {
          res.status(403).json({ 
            error: 'Límite diario alcanzado', 
            message: 'Has agotado tus 30 minutos diarios del plan Free. Actualiza a Pro para continuar practicando sin límites.' 
          });
          return;
        }
      }
    }

    // 3. Crear la nueva sesión de estudio
    const { data: newSession, error: insertError } = await supabase
      .from('learning_sessions')
      .insert({
        user_id: userId,
        mode,
        started_at: new Date(),
      })
      .select()
      .single();

    if (insertError) {
      res.status(400).json({ error: 'Error al iniciar la sesión', details: insertError.message });
      return;
    }

    res.status(201).json({ message: 'Sesión iniciada con éxito', session: newSession });
  } catch (err) {
    console.error('Error al iniciar sesión de aprendizaje:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PATCH /api/v1/learning/sessions/:id/end - Finalizar sesión y calcular duración
export const endSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id: sessionId } = req.params;

    // 1. Buscar la sesión y verificar que pertenezca al usuario
    const { data: session, error: findError } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (findError || !session) {
      res.status(404).json({ error: 'Sesión no encontrada' });
      return;
    }

    if (session.ended_at) {
      res.status(400).json({ error: 'Esta sesión ya había sido finalizada' });
      return;
    }

    // 2. Calcular la duración en segundos
    const endedAt = new Date();
    const startedAt = new Date(session.started_at);
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    // 3. Actualizar la sesión con la hora de término y duración
    const { data: updatedSession, error: updateError } = await supabase
      .from('learning_sessions')
      .update({
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      res.status(400).json({ error: 'Error al finalizar la sesión', details: updateError.message });
      return;
    }

    res.json({ message: 'Sesión finalizada con éxito', session: updatedSession });
  } catch (err) {
    console.error('Error al finalizar sesión:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};