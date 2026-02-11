
import { GoogleGenAI } from "@google/genai";

// Standard implementation for Gemini API services.
export class GeminiStylistService {
  /**
   * Fetches fashion advice for a specific product.
   * Always uses the latest API key from process.env.API_KEY.
   */
  async getStylingAdvice(productName: string, userAttributes?: string) {
    try {
      // Initialize the API client inside the method to ensure environment variables are fresh.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a high-end fashion stylist for a SaaS platform. 
        Provide a concise (2-sentence) styling tip for the product: "${productName}". 
        ${userAttributes ? `Context: User is ${userAttributes}.` : ''} 
        Focus on what it pairs well with and appropriate occasions.`,
        config: {
          temperature: 0.7,
        }
      });
      // Correctly access the .text property as a getter, not a function call.
      return response.text || "This versatile piece works perfectly for both casual outings and professional settings.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Style this classic piece with neutral tones for a sophisticated look.";
    }
  }
}

export const geminiService = new GeminiStylistService();
