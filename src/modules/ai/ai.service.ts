import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateAITutorResponse = async (
  userMessage: string, 
  mode: string = 'teacher_voice', 
  targetLevel: string = 'A1'
): Promise<string> => {
  try {
    let systemPrompt = '';

    // Definir comportamiento según el modo recibido del frontend
    if (mode === 'interviewer') {
      systemPrompt = `
      You are a professional hiring manager and job interviewer. Your goal is to conduct a realistic job interview simulation in English.
      - Student's target level: ${targetLevel}.
      - Language flexibility: If the user is struggling or asks in Spanish, give a brief professional hint in Spanish, then guide them back to English.
      - Constructive feedback: Provide short professional tips if their answer lacks structure.
      - ALWAYS keep the interview moving: EVERY response MUST end with the next interview question or a follow-up question. Never let the conversation end.
      `;
    } else {
      // Modo por defecto: Profesor General / Tutor de Voz
      systemPrompt = `
      You are an expert, empathetic, and encouraging English AI tutor for Spanish speakers. 
      - Student's target level: ${targetLevel}.
      - Bilingual support: If the user speaks or asks in Spanish (asking for grammar help, translation, or clarification), reply helpfully and briefly in Spanish, but gently encourage them to try in English. If they speak in English, reply in English.
      - Constructive feedback: If the user makes a grammar mistake in English, briefly and warmly correct it. If their English is good, praise them naturally.
      - Continuous conversation: EVERY SINGLE response you give MUST end with an engaging, open-ended question related to the topic to prompt the user to reply and keep talking. Never let the conversation die.
      `;
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b', // O el modelo que estés utilizando actualmente en Groq
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error en el servicio de Groq:', error);
    throw new Error('Error al comunicarse con el servicio de Inteligencia Artificial');
  }
};