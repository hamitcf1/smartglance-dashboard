import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client
// IMPORTANT: process.env.API_KEY is injected by the environment.
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

// Preferred models in order of preference
const PREFERRED_MODELS = [
  'gemma-3-27b',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

/**
 * Generic function to generate content using Gemini API
 * Handles API key validation, model fallbacks, and error handling
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    if (!process.env.API_KEY) {
      console.error("Gemini API Key not configured");
      throw new Error("Gemini API key not found. See API_SETUP.md for instructions.");
    }

    let lastErr: any = null;
    
    for (const modelName of PREFERRED_MODELS) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await model.generateContent(prompt);

        // SDK responses differ; attempt common accessors
        let textContent: string | undefined;
        if (response && typeof (response as any).text === 'function') {
          textContent = (response as any).text();
        } else if ((response as any).response && typeof (response as any).response.text === 'function') {
          textContent = (response as any).response.text();
        } else if ((response as any).candidates && (response as any).candidates[0]) {
          textContent = (response as any).candidates[0].content?.parts?.[0]?.text;
        }

        if (textContent && textContent.trim()) {
          console.log(`Success with model: ${modelName}`);
          return textContent;
        }
      } catch (err: any) {
        lastErr = err;
        const errorStr = JSON.stringify(err);
        console.warn(`Model ${modelName} failed:`, err?.message || err);
        
        // Check for quota error and continue to next model
        if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED')) {
          console.log(`Quota exceeded for ${modelName}, trying next model...`);
          continue;
        }
        // Continue trying other models
        continue;
      }
    }

    // If all attempts failed, throw last error
    if (lastErr) {
      const errorStr = JSON.stringify(lastErr);
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("API Quota Exceeded: All models have exhausted quota. Try again later.");
      }
      throw lastErr;
    }
    throw new Error("All models failed to generate content");
  } catch (error: any) {
    console.error("Error generating content:", error);
    const errorMessage = error?.message || 'Unknown error';
    
    if (errorMessage.includes('API_KEY') || errorMessage.includes('api_key') || errorMessage.includes('invalid')) {
      throw new Error("Setup Error: Check your Gemini API key. See API_SETUP.md for instructions.");
    }
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("API Quota Exceeded: Try again later or upgrade your Gemini API quota.");
    }
    throw error;
  }
}

export async function generateDailyBriefing(userName: string, contextTime: string, weatherSummary?: string): Promise<string> {
  try {
    const prompt = `
      You are a helpful personal dashboard assistant.
      The current time is ${contextTime}.
      The user's name is ${userName}.
      ${weatherSummary ? `The current weather is: ${weatherSummary}.` : ''}

      Please provide a concise, friendly, and motivating "Daily Briefing".
      
      Structure your response in Markdown:
      1. A short greeting tailored to the time of day.
      2. A "Focus Tip" or "Thought of the Day" (keep it brief and inspiring).
      3. A very short interesting fact relevant to today's date (if applicable) or a general fun fact.
      
      Keep the tone professional yet warm. Limit the total output to around 100-150 words. Do not use H1 or H2 tags, use bolding for emphasis.
    `;

    return await generateContent(prompt);
  } catch (error: any) {
    console.error("Error generating briefing:", error);
    const errorMessage = error?.message || 'Unknown error';
    
    if (errorMessage.includes('Setup Error')) {
      return errorMessage;
    }
    if (errorMessage.includes('Quota')) {
      return errorMessage;
    }
    return "Welcome back! I couldn't generate your personalized briefing right now, but I hope you have a productive day.";
  }
}
