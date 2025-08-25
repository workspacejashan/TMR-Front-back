import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { JobPostDetails, Message } from '../types';

// --- TEMPORARY & INSECURE: Hardcoding API Key for development ---
// WARNING: This is NOT safe for production. Your key is visible in the code.
// Get a key from Google AI Studio and replace the placeholder below.
const apiKey = "YOUR_GEMINI_API_KEY_HERE";
// --- END OF INSECURE CODE ---

// const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? process.env.API_KEY;
let ai: GoogleGenAI;

if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE") {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn(
    `%cGemini API key is not set!`, 
    'color: orange; font-weight: bold; font-size: 14px;',
    `
The application will not connect to the Gemini API.
Please get a key from Google AI Studio and add it directly into 'services/geminiService.ts'.`
  );
}


export const geminiService = {
  isConfigured: !!(apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE"),

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