import { Request, Response, NextFunction } from 'express';
import { supabase } from '../database/supabase';

// Extendemos la interfaz Request de Express para incluir al usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extraer el encabezado Authorization ("Bearer <token>")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autenticación no proporcionado o formato inválido' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // 2. Validar el token directamente contra Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Token inválido o expirado' });
      return;
    }

    // 3. Inyectar los datos del usuario en la petición y dejarla pasar
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error('Error en requireAuth middleware:', err);
    res.status(500).json({ error: 'Error interno al validar la autenticación' });
  }
};