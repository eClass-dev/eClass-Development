import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, MindMapNode, QuizQuestion, ChartData } from '../types';

// The user prompt indicates the API key is set up, so we can assume it's available.
// However, the provided code throws an error if it's not set. This is good practice.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a more user-friendly error or guide them.
  // For this environment, throwing an error is fine.
  throw new Error("API_KEY environment variable not set. Please configure it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getJson = (response: any): any => {
    // The Gemini API returns a response object with a `text` accessor for the main text.
    let text = response.text;
    if (!text) {
        console.error("API response is missing text property.", response);
        throw new Error("Received an invalid response structure from the API.");
    }

    text = text.trim();
    // Clean the response to be valid JSON by removing markdown code fences.
    const cleanedText = text.replace(/^```json/, '').replace(/```$/, '').trim();
    try {
        return JSON.parse(cleanedText);
    } catch(e) {
        console.error("Failed to parse JSON:", cleanedText, "Original text:", text);
        throw new Error("Received invalid JSON from API after cleaning.");
    }
}

const promptSuffix = "Please provide the output as clean text without any markdown formatting (e.g., no **, *, or # symbols).";

export const generateFlashcards = async (text: string, count: number): Promise<Flashcard[]> => {
  const flashcardSchema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "A question about a key concept from the text." },
      answer: { type: Type.STRING, description: "A concise answer to the question." },
    },
    required: ['question', 'answer'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `First, analyze the structure of the following raw text to identify key topics and concepts. Then, based on that understanding, generate exactly ${count} flashcards for studying. Each flashcard should have a clear question and a concise answer. ${promptSuffix} Text: ${text}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: flashcardSchema,
      },
    },
  });

  return getJson(response);
};

export const generateMindMap = async (text: string): Promise<MindMapNode> => {
    // Define a non-recursive, inlined schema for a 3-level deep mind map to avoid call stack errors.
    const mindMapSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The main subject or root node of the mind map." },
            children: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "A key topic." },
                        children: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "A sub-topic or leaf concept." },
                                },
                                required: ['name'],
                            },
                        },
                    },
                    required: ['name'],
                },
            },
        },
        required: ['name'],
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `From the raw text provided, first identify the main subject, key themes, and their relationships. Then, create a hierarchical mind map representing the main topics and sub-topics. The root node should be the main subject of the text. Go about 3 levels deep. ${promptSuffix} Text: ${text}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: mindMapSchema,
        },
      });

    return getJson(response);
};

export const generateQuiz = async (text: string, count: number): Promise<QuizQuestion[]> => {
    const quizSchema = {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "A multiple-choice question about the text." },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 4 possible answers."
          },
          correctAnswer: { type: Type.STRING, description: "The correct answer, which must be one of the strings in the 'options' array." },
        },
        required: ['question', 'options', 'correctAnswer'],
      };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following text to understand its key information. Then, generate a multiple-choice quiz with exactly ${count} questions. Each question must have exactly 4 options, and one must be correct. Ensure the correctAnswer value is one of the strings in the options array. ${promptSuffix} Text: ${text}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: quizSchema,
          },
        },
      });
      
    return getJson(response);
};

export const generateVisualAid = async (text: string): Promise<ChartData> => {
    const chartDataSchema = {
        type: Type.OBJECT,
        properties: {
            labels: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "The labels for the X-axis of a bar chart."
            },
            datasets: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING, description: "The label for this dataset (e.g., 'Key Statistics')." },
                        data: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                            description: "The numerical data points corresponding to the labels."
                        }
                    },
                    required: ["label", "data"]
                },
                description: "An array of datasets for the chart. Usually just one."
            }
        },
        required: ["labels", "datasets"]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `First, analyze the following text to find quantitative data or, if none exists, the frequency or importance of key concepts. Based on this analysis, generate data for a simple bar chart to visualize the information. Extract the data and format it for a chart with labels and one or more datasets. ${promptSuffix} Text: ${text}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: chartDataSchema,
        },
      });
      
    return getJson(response);
};

export const generateSummary = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following text and create a concise, bullet-point summary of its key points and factual information. Each bullet point must start with a hyphen (-). Focus on summarizing the actual content of the document, not its context or purpose. For example, instead of saying 'This document explains photosynthesis', say '- Photosynthesis is the process plants use to convert light into energy'. ${promptSuffix} Text: ${text}`,
    });
    return response.text;
}