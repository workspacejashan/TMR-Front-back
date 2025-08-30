import { GoogleGenAI, Type, GenerateContentResponse, Action } from "@google/genai";
import { Job, JobPostDetails, Message, MessageAuthor, JobSearchCriteria } from '../types';

// Guideline: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const API_KEY = process.env.API_KEY;

// Check if the API key is provided. If not, the service will be marked as not configured.
export const isConfigured = !!API_KEY;

let ai: GoogleGenAI | null = null;
if (isConfigured) {
  // Guideline: Always use new GoogleGenAI({apiKey: process.env.API_KEY});
  ai = new GoogleGenAI({ apiKey: API_KEY! });
} else {
  console.warn(
    `%cGoogle Gemini API key is not set!`,
    'color: orange; font-weight: bold; font-size: 14px;',
    `
The application will not be able to make AI requests.
Please set the API_KEY environment variable in your project settings.`
  );
}

const getChatResponse = async (history: Message[], systemInstruction: string): Promise<{ text: string, action?: Action }> => {
    if (!ai) return { text: "AI is not configured. Please set your API key." };

    const contents = history.map(msg => ({
        role: msg.author === MessageAuthor.USER ? 'user' as const : 'model' as const,
        parts: [{ text: msg.text }]
    }));

    try {
        // Guideline: Use 'gemini-2.5-flash' for general text tasks
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            config: {
                responseMimeType: "application/json",
            }
        });

        // Guideline: The simplest and most direct way to get the generated text content is by accessing the .text property
        const responseText = response.text;
        const responseJson = JSON.parse(responseText);

        if (responseJson && typeof responseJson.text === 'string') {
            return {
                text: responseJson.text,
                action: responseJson.action || undefined
            };
        }
        
        return { text: "Sorry, I received an unexpected response from the AI. Please try again." };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { text: "Sorry, I couldn't process that. An error occurred." };
    }
};

const extractJobCriteria = async (text: string): Promise<Partial<JobPostDetails>> => {
    if (!ai) return {};

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        location: { type: Type.STRING }
                    }
                }
            }
        });

        const responseText = response.text;
        const responseJson = JSON.parse(responseText);

        if (responseJson && (responseJson.title || responseJson.skills || responseJson.location)) {
            return {
                title: responseJson.title || '',
                skills: responseJson.skills || [],
                location: responseJson.location || ''
            };
        }

        return {};
    } catch (error) {
        console.error("Error extracting job criteria with Gemini:", error);
        return {};
    }
};

const findJobsWithAi = async (criteria: JobSearchCriteria): Promise<Job[]> => {
    if (!ai) return [];
    
    const userPrompt = `Generate 5 realistic, mock job listings for the following criteria:
    Roles: ${criteria.roles.join(', ')}
    Location: ${criteria.location}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: userPrompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        jobs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    company: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    applyUrl: { type: Type.STRING }
                                },
                                required: ["id", "title", "company", "location", "description", "applyUrl"]
                            }
                        }
                    },
                    required: ["jobs"]
                }
            }
        });

        const responseText = response.text;
        const responseJson = JSON.parse(responseText);

        if (responseJson && Array.isArray(responseJson.jobs)) {
            return responseJson.jobs;
        }

        return [];
    } catch (error) {
        console.error("Error finding jobs with Gemini:", error);
        return [];
    }
};

export const aiService = {
  isConfigured,
  getChatResponse,
  extractJobCriteria,
  findJobsWithAi,
};