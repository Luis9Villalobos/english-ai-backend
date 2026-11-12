import { supabase } from '../../shared/database/supabase.client'; // O tu cliente de supabase configurado

export async function checkAndStartSession(userId: string, mode: string) {
  // 1. Verificar el plan del usuario (asumiendo que tienes una tabla de suscripciones o perfil con el plan)
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions') // O la tabla donde guardes el plan ('FREE' / 'PRO')
    .select('plan_type')
    .eq('user_id', userId)
    .single();

  // Si por defecto es FREE o no se encuentra registro, asumimos FREE por seguridad
  const planType = subscription?.plan_type || 'FREE';

  if (planType === 'FREE') {
    // 2. Calcular el inicio del día actual (00:00:00 UTC o local según tu BD)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // 3. Consultar las sesiones de hoy para sumar su duración
    const { data: sessions, error: sessionsError } = await supabase
      .from('learning_sessions')
      .select('duration_seconds')
      .eq('user_id', userId)
      .gte('started_at', todayStart.toISOString());

    if (sessionsError) {
      throw new Error('Error al verificar el tiempo de estudio diario');
    }

    // 4. Sumar los segundos acumulados hoy
    const totalSecondsToday = sessions.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
    const DAILY_LIMIT_SECONDS = 1800; // 30 minutos

    if (totalSecondsToday >= DAILY_LIMIT_SECONDS) {
      throw new Error('LIMIT_EXCEEDED: Has alcanzado el límite diario de 30 minutos de tu plan Free. ¡Actualiza a Pro para continuar practicando sin límites!');
    }
  }

  // 5. Si pasa la validación, procedemos a crear la sesión
  const { data: newSession, error: insertError } = await supabase
    .from('learning_sessions')
    .insert([
      { user_id: userId, mode, duration_seconds: 0, started_at: new Date().toISOString() }
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error('Error al iniciar la sesión de aprendizaje');
  }

  return newSession;
}