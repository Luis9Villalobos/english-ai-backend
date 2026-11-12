import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requireAuth, AuthenticatedRequest } from './shared/api/auth.middleware';
import { identityRoutes } from './modules/identity/identity.routes';
import { learningRoutes } from './modules/learning/learning.routes';
import { aiRoutes } from './modules/ai/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ruta de comprobación
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Monolito Modular funcionando 🚀' });
});

// Ruta de prueba protegida
app.get('/api/v1/test-auth', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ message: '¡Acceso autorizado!', user: req.user });
});

// Montar rutas de los módulos
app.use('/api/v1', identityRoutes);
app.use('/api/v1', learningRoutes);
app.use('/api/v1', aiRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});