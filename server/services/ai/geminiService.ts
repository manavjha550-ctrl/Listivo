import { GoogleGenAI } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('[GeminiService] Failed to initialize GoogleGenAI client:', err);
    }
  }
  return genAIClient;
}

export async function generateJSONWithGemini(prompt: string, fallbackData: any): Promise<{ data: any; source: 'gemini-ai' | 'smart-template-engine' }> {
  const client = getClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        // Clean markdown code blocks if present
        let cleanText = response.text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanText);
        return { data: parsed, source: 'gemini-ai' };
      }
    } catch (err) {
      console.warn('[GeminiService] Gemini AI call failed or timed out. Switching to structured template engine fallback:', err);
    }
  }

  return { data: fallbackData, source: 'smart-template-engine' };
}
