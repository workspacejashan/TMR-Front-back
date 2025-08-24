import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { JobPostDetails, Message } from '../types';

// This file should not be committed with a real API key.
// It's assumed process.env.API_KEY is configured in the deployment environment.
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? process.env.API_KEY;
let ai: GoogleGenAI;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn(
    `%cGemini API key is not set!`, 
    'color: orange; font-weight: bold; font-size: 14px;',
    `
The application will not connect to the Gemini API.
Please create a '.env' file in the root of your project and add your Gemini API key:
  
  VITE_GEMINI_API_KEY=your-api-key

You can get a key from Google AI Studio.`
  );
}


export const geminiService = {
  isConfigured: !!apiKey,

  getChatResponse: async (history: Message[], systemInstruction: string): Promise<string> => {
    if (!ai) return "The AI service is not configured.";

    const contents = history.map(msg => ({
        role: msg.author === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction
        }
    });

    return response.text;
  },

  extractJobCriteria: async (prompt: string): Promise<Partial<JobPostDetails>> => {
      if (!ai) return {};
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Extract the job title, key skills (as an array of strings), and location from the following user request. If a piece of information is missing, omit the key. User request: "${prompt}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: 'The job title or role.',
                    },
                    skills: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                        description: 'A list of required skills.',
                    },
                    location: {
                        type: Type.STRING,
                        description: 'The work location (e.g., city, state, or "Remote").',
                    },
                },
            },
        },
      });
      
      try {
          const jsonStr = response.text.trim();
          return JSON.parse(jsonStr);
      } catch (e) {
          console.error("Error parsing Gemini JSON response:", e);
          return {};
      }
  },
};
