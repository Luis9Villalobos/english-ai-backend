import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/api/auth.middleware';
import { supabase } from '../../shared/database/supabase';

// GET /api/v1/profile/me - Obtener el perfil del usuario autenticado
export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      res.status(404).json({ error: 'Perfil no encontrado' });
      return;
    }

    res.json(profile);
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PATCH /api/v1/profile/me - Actualizar nombre, nivel objetivo o idioma
export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { display_name, target_level, native_language } = req.body;

    const updates: any = { updated_at: new Date() };
    if (display_name !== undefined) updates.display_name = display_name;
    if (target_level !== undefined) updates.target_level = target_level;
    if (native_language !== undefined) updates.native_language = native_language;

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: 'Error al actualizar el perfil', details: error.message });
      return;
    }

    res.json({ message: 'Perfil actualizado con éxito', profile: updatedProfile });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};