import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Job, JobPostDetails, Message, Action, MessageAuthor } from '../types';

interface AiChatResponse {
  text: string;
  action?: Action;
}

// API_KEY is expected to be set in the environment.
const API_KEY = process.env.API_KEY;

// Initialize the Google GenAI client. Null if API_KEY is not available.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// The schema for the AI's chat response.
const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: 'Your conversational response.' },
        action: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                type: { type: Type.STRING, description: 'The type of action to perform.' },
                payload: {
                    type: Type.OBJECT,
                    nullable: true,
                    properties: {
                        modalType: { type: Type.STRING, nullable: true, description: 'The modal to open.' },
                        flowName: { type: Type.STRING, nullable: true, description: 'The flow to start.' },
                    },
                },
            },
        },
    },
    required: ['text'],
};

// The schema for extracting job criteria from a prompt.
const jobCriteriaSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The job title.' },
        skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of key skills for the job.'
        },
        location: { type: Type.STRING, description: 'The job location.' },
    },
    required: ['title', 'skills', 'location'],
};

// The schema for generating a list of fictional jobs.
const jobsListSchema = {
    type: Type.OBJECT,
    properties: {
        jobs: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: 'A random unique string ID.' },
                    title: { type: Type.STRING },
                    company: { type: Type.STRING, description: 'A plausible but generic company name.' },
                    location: { type: Type.STRING },
                    description: { type: Type.STRING, description: 'A 2-3 sentence summary of the job.' },
                    applyUrl: { type: Type.STRING, description: 'A placeholder URL like "https://example.com/apply/job-id".' },
                },
                required: ['id', 'title', 'company', 'location', 'description', 'applyUrl'],
            },
        },
    },
    required: ['jobs'],
};

export const geminiService = {
  isConfigured: !!ai,

  getChatResponse: async (history: Message[], systemInstruction: string): Promise<AiChatResponse> => {
    if (!ai) return { text: "The AI service is not configured." };

    const contents = history.map(msg => ({
        role: msg.author === MessageAuthor.USER ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: chatResponseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedResponse = JSON.parse(jsonStr) as AiChatResponse;

        if (typeof parsedResponse.text !== 'string') {
            return { text: "Sorry, I received an invalid response from the AI." };
        }

        return parsedResponse;

    } catch (e) {
        console.error("Error calling Gemini API:", e);
        return { text: "Sorry, I encountered an error connecting to the AI service."};
    }
  },

  extractJobCriteria: async (prompt: string): Promise<Partial<JobPostDetails>> => {
      if (!ai) return {};
      
      const systemInstruction = `You are an expert data extractor. Extract the job title, key skills, and location from the user's request. If a piece of information is missing, use an empty string or empty array.`;
      
      try {
          const response: GenerateContentResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  systemInstruction: systemInstruction,
                  responseMimeType: "application/json",
                  responseSchema: jobCriteriaSchema,
              },
          });
          
          const jsonStr = response.text.trim();
          return JSON.parse(jsonStr);
          
      } catch (e) {
          console.error("Error parsing or fetching from Gemini API:", e);
          return {};
      }
  },

  findJobsWithAi: async (criteria: { roles: string[]; location: string; }): Promise<Job[]> => {
    if (!ai) return [];

    const query = `${criteria.roles.join(', ')} jobs in ${criteria.location || 'USA'}`;
    const userPrompt = `Generate up to 5 realistic, plausible, but fictional job postings based on the user's query. These jobs should seem real but are for demonstration purposes.
    - Invent plausible but generic company names (e.g., "Innovate Health", "Tech Solutions Inc.").
    - "applyUrl" should be a placeholder like "https://example.com/apply/job-id".
    
    User Query: "${query}"`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: "You are an expert job search assistant.",
                responseMimeType: "application/json",
                responseSchema: jobsListSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedResponse = JSON.parse(jsonStr);

        if (parsedResponse && Array.isArray(parsedResponse.jobs)) {
            return parsedResponse.jobs as Job[];
        }
        return [];

    } catch (e) {
      console.error("Error finding jobs with AI:", e);
      return [];
    }
  },
};