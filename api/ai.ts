// This is a Vercel Serverless Function to securely proxy requests to the Google Gemini AI API.
// FIX: Switched from OpenRouter to Google Gemini API and implemented according to guidelines.
import { GoogleGenAI } from "@google/genai";

// Vercel specific configuration
export const config = {
  runtime: 'edge', // Using the Edge runtime for lower latency
};

// Define the expected request body structure from the frontend
interface AiApiRequest {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
}

export default async function handler(request: Request) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Retrieve the secret API key from environment variables.
  // Guideline: The API key must be obtained exclusively from the environment variable process.env.API_KEY
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error('API_KEY is not set in environment variables.');
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing API key.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = (await request.json()) as AiApiRequest;

    if (!messages || !Array.isArray(messages)) {
       return new Response(JSON.stringify({ error: 'Invalid request body: "messages" is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Guideline: Always use new GoogleGenAI({apiKey: process.env.API_KEY});
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const systemInstruction = messages.find(m => m.role === 'system')?.content;
    const history = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }]
    }));

    if (history.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid request body: No user/assistant messages found.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Guideline: Use 'gemini-2.5-flash' for general text tasks
    // Guideline: Use config for responseMimeType
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
            responseMimeType: "application/json",
        },
        ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } }),
    });

    // Guideline: To get text, use response.text
    const text = response.text;

    // Maintain the response structure expected by the client
    const responsePayload = {
        choices: [{
            message: {
                content: text
            }
        }]
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI API proxy:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}