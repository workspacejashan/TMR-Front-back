import { Job, JobPostDetails, Message, Action, MessageAuthor, JobSearchCriteria } from '../types';

interface AiChatResponse {
  text: string;
  action?: Action;
}

// Using OpenRouter API as requested
const OPENROUTER_API_KEY = "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";
const MODEL_NAME = "meta-llama/llama-3-8b-instruct";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const callApi = async (messages: {role: 'system' | 'user' | 'assistant', content: string}[]) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: messages,
                response_format: { type: "json_object" },
            }),
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('OpenRouter API Error:', response.status, errorBody);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        if (content) {
            // The model is instructed to return a JSON string, so we parse it.
            return JSON.parse(content);
        }
        return null;
    } catch (error) {
        console.error("Error calling OpenRouter API:", error);
        return null;
    }
}


const getChatResponse = async (history: Message[], systemInstruction: string): Promise<AiChatResponse> => {
    const messages = [
        { role: 'system' as const, content: systemInstruction },
        ...history.map(msg => ({
            role: msg.author === MessageAuthor.USER ? 'user' as const : 'assistant' as const,
            content: msg.text
        }))
    ];

    const responseJson = await callApi(messages);

    if (responseJson && typeof responseJson.text === 'string') {
        return {
            text: responseJson.text,
            action: responseJson.action || undefined
        };
    }
    
    return { text: "Sorry, I couldn't process that. Please try again." };
};

const extractJobCriteria = async (text: string): Promise<Partial<JobPostDetails>> => {
    const systemInstruction = `You are an AI assistant that extracts job criteria from a user's text.
    Analyze the text and identify the job title, key skills, and location.
    Respond with a JSON object containing three keys: "title", "skills" (an array of strings), and "location".
    If a field is not mentioned, its value should be an empty string or an empty array.
    Example: for "find me a registered nurse in texas with iv insertion skills", you would return:
    { "title": "Registered Nurse", "skills": ["IV insertion"], "location": "Texas" }`;
    
    const messages = [
        { role: 'system' as const, content: systemInstruction },
        { role: 'user' as const, content: text }
    ];

    const responseJson = await callApi(messages);

    if (responseJson && (responseJson.title || responseJson.skills || responseJson.location)) {
        return {
            title: responseJson.title || '',
            skills: responseJson.skills || [],
            location: responseJson.location || ''
        };
    }

    return {};
};

const findJobsWithAi = async (criteria: JobSearchCriteria): Promise<Job[]> => {
    const systemInstruction = `You are an AI that generates realistic, mock job listings for a job board.
    Based on the user's criteria, create a list of 5 job postings.
    You MUST respond with a single JSON object containing a key "jobs", which is an array of job objects.
    Each job object must have the following properties: "id" (a unique string, e.g., "job-1"), "title", "company", "location", "description", and "applyUrl" (use a placeholder like "https://example.com/apply").
    The job descriptions should be detailed and relevant to the role.`;
    
    const userPrompt = `Generate 5 job listings for the following criteria:
    Roles: ${criteria.roles.join(', ')}
    Location: ${criteria.location}`;

    const messages = [
        { role: 'system' as const, content: systemInstruction },
        { role: 'user' as const, content: userPrompt }
    ];

    const responseJson = await callApi(messages);

    if (responseJson && Array.isArray(responseJson.jobs)) {
        return responseJson.jobs;
    }
    
    return [];
};


export const aiService = {
  isConfigured: !!OPENROUTER_API_KEY,
  getChatResponse,
  extractJobCriteria,
  findJobsWithAi,
};
