import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  freePlanDailyLimitSeconds: 30 * 60, // 30 minutos
  defaultAIModel: 'openai/gpt-oss-20b',
  safetyAIModel: 'openai/gpt-oss-safeguard-20b',
};