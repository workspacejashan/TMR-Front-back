import { GoogleGenAI } from "@google/genai";
import { Job, JobSearchCriteria, JobSource } from "../types";

// FIX: Implement the jobSearchService to resolve the module error and provide the findJobs function needed by useChat.ts.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const findJobs = async (criteria: JobSearchCriteria): Promise<{ jobs: Job[], sources: JobSource[] }> => {
    const prompt = `Find up-to-date, real job listings for the following roles: "${criteria.roles.join(', ')}" in or near "${criteria.location}". 
    For each job, provide a unique ID (as a string), title, company name, location, a brief 2-3 sentence description, and a direct URL to apply.
    Return the result as a valid JSON object with a single key "jobs" which is an array of these job objects. Example: {"jobs": [{"id": "some-unique-id", "title": "...", ...}]}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const sources: JobSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => ({
                uri: chunk.web.uri,
                title: chunk.web.title,
            }))
            .filter((source: JobSource | undefined): source is JobSource => !!(source && source.uri && source.title)) ?? [];
        
        let text = response.text.trim();
        // The model can sometimes wrap the JSON in markdown backticks
        if (text.startsWith('```json')) {
            text = text.substring(7, text.length - 3).trim();
        } else if (text.startsWith('`')) {
            text = text.substring(1, text.length - 1).trim();
        }

        const jsonResponse = JSON.parse(text);
        const jobs: Job[] = jsonResponse.jobs || [];

        // Ensure each job has a unique ID, as model might not provide one.
        return { jobs: jobs.map((job, index) => ({...job, id: job.id || `job-${Date.now()}-${index}`})), sources };

    } catch (error) {
        console.error("Error finding jobs with Gemini:", error);
        // Fallback or error handling
        return { jobs: [], sources: [] };
    }
};

export const jobSearchService = {
    findJobs,
};
