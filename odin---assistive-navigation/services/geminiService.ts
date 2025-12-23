
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  // We initialize the client right before each call to ensure the latest API key is used
  // and to follow initialization guidelines.

  async analyzeFrame(base64Image: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Act as a navigation assistant for a blind person. Identify all immediate physical obstacles, terrain changes (stairs, curbs), or people. For each, give a clear label, approximate distance in meters, and direction as a clock number (1-12 where 12 is straight, 3 is right, etc.). Also assign a severity: 'high' for immediate collision, 'medium' for nearby objects, 'low' for distant path clearers. Output valid JSON array only." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                distance: { type: Type.NUMBER },
                direction: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
              },
              required: ['label', 'distance', 'direction', 'severity']
            }
          }
        }
      });

      // Directly access .text property
      const text = response.text;
      return JSON.parse(text || "[]");
    } catch (error: any) {
      // Check for quota exhaustion (429) or other API errors
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota')) {
        throw new Error('QUOTA_EXHAUSTED');
      }
      console.error("Gemini Analysis Error:", error);
      return [];
    }
  }

  async queryLocation(query: string, lat?: number, lng?: number) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (lat !== undefined && lng !== undefined) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: config
      });

      return {
        // Directly access .text property
        text: response.text,
        grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota')) {
        throw new Error('QUOTA_EXHAUSTED');
      }
      console.error("Location Query Error:", error);
      return { text: "I'm having trouble accessing map data right now.", grounding: [] };
    }
  }
}

export const geminiService = new GeminiService();
