import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client
// IMPORTANT: process.env.API_KEY is injected by the environment.
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

export async function generateDailyBriefing(userName: string, contextTime: string, weatherSummary?: string): Promise<string> {
  try {
    if (!process.env.API_KEY) {
      console.error("Gemini API Key not configured");
      return "Setup Error: Gemini API key not found. See API_SETUP.md for instructions.";
    }

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

    // Prefer recent Gemini models available to this key. Try several fallbacks.
    const preferredModels = [
      'gemma-3-27b',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'text-bison'
    ];

    let lastErr: any = null;
    for (const m of preferredModels) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
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

        if (textContent && textContent.trim()) return textContent;
      } catch (err: any) {
        lastErr = err;
        // try next model
        continue;
      }
    }

    // If all attempts failed, throw last error to be handled below
    if (lastErr) throw lastErr;
    return "Have a wonderful day!";
  } catch (error: any) {
    console.error("Error generating briefing:", error);
    const errorMessage = error?.message || 'Unknown error';
    if (errorMessage.includes('API_KEY') || errorMessage.includes('api_key') || errorMessage.includes('invalid')) {
      return "Setup Error: Check your Gemini API key. See API_SETUP.md for instructions.";
    }
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      return "API Quota Exceeded: Try again later or upgrade your Gemini API quota.";
    }
    return "Welcome back! I couldn't generate your personalized briefing right now, but I hope you have a productive day.";
  }
}
