
import { GoogleGenAI } from "@google/genai";

export const getGeminiGreeting = async (name: string): Promise<string> => {
  if (!process.env.API_KEY) return `Welcome back to ZPRIA, ${name}! Ready to explore?`;
  
  try {
    // Initialize GoogleGenAI with the API key from process.env directly inside the function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, enthusiastic welcome message for a user named ${name} who just logged into their ZPRIA universal account. ZPRIA is a design-focused ecosystem. Keep it professional yet creative. Max 15 words.`,
    });
    // Use .text property to access content, as per instructions
    return response.text || `Welcome back to ZPRIA, ${name}!`;
  } catch (error) {
    console.error("Gemini Greeting Error:", error);
    return `Welcome back, ${name}!`;
  }
};

export const getSecurityRecommendation = async (userStatus: { emailVerified: boolean, mobileVerified: boolean }): Promise<string> => {
  if (!process.env.API_KEY) return "Protect your ZPRIA PRAGOD with two-factor authentication.";

  try {
    // Initialize GoogleGenAI with the API key from process.env directly inside the function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user has Email Verified: ${userStatus.emailVerified}, Mobile Verified: ${userStatus.mobileVerified}. Suggest one quick security tip for their ZPRIA PRAGOID identity. Keep it concise.`,
    });
    // Use .text property to access content, as per instructions
    return response.text || "Enable 2FA to keep your ZPRIA account safe.";
  } catch (error) {
    console.error("Gemini Security Error:", error);
    return "Ensure your ZPRIA password is strong and unique.";
  }
};
