import { Groq } from 'groq-sdk';
import { config } from '@/shared/config/env.config';

const groq = new Groq({ apiKey: config.groqApiKey });

export async function checkContentSafety(text: string): Promise<boolean> {
  try {
    const completion = await groq.chat.completions.create({
      model: config.safetyAIModel,
      messages: [
        { 
          role: 'system', 
          content: 'You are a content safety classifier. Reply strictly with "SAFE" if the text is appropriate, or "UNSAFE" if it contains abuse, hate speech, or explicit harm.' 
        },
        { role: 'user', content: text }
      ],
      max_tokens: 10,
    });

    const responseText = completion.choices[0]?.message?.content?.trim().toUpperCase() || 'SAFE';
    return responseText.includes('SAFE') && !responseText.includes('UNSAFE');
  } catch (error) {
    console.error('Error en el servicio de moderación (permitiendo paso por defecto):', error);
    return true; // Ante un fallo técnico del moderador, no bloqueamos al usuario por error
  }
}