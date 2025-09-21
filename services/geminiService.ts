import { GoogleGenAI } from "@google/genai";

// FIX: Initialize the GoogleGenAI client and implement the aiService to resolve the module error.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateText = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error generating text with Gemini:', error);
        return 'Sorry, I am unable to process your request at the moment.';
    }
};

export const aiService = {
    generateText,
};
