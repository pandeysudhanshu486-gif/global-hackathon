import { env } from '../config/env.js';
import { logger } from '../shared/logger.js';

export interface GeminiInlineData {
  mimeType: string;
  data: string; // Base64 encoded
}

export class GeminiClient {
  private static readonly API_ENDPOINT =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  /**
   * Checks whether a valid Gemini API key is configured
   */
  public static isConfigured(): boolean {
    const key = env.GEMINI_API_KEY;
    return Boolean(key && key.trim().length > 10 && !key.includes('dev_placeholder'));
  }

  /**
   * Generates a structured JSON response from Gemini with timeout and error containment
   */
  public static async generateJson<T>(
    prompt: string,
    inlineData?: GeminiInlineData,
    timeoutMs = 15000
  ): Promise<T | null> {
    if (!this.isConfigured()) {
      logger.debug('GeminiClient: GEMINI_API_KEY is not configured. Falling back to deterministic extractor.');
      return null;
    }

    const apiKey = env.GEMINI_API_KEY;
    const url = `${this.API_ENDPOINT}?key=${apiKey}`;

    const parts: Array<Record<string, unknown>> = [];

    if (inlineData) {
      parts.push({
        inlineData: {
          mimeType: inlineData.mimeType,
          data: inlineData.data,
        },
      });
    }

    parts.push({ text: prompt });

    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`Gemini API HTTP Error (${response.status}): ${errorText.substring(0, 200)}`);
        return null;
      }

      const responseData: any = await response.json();
      const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        logger.warn('Gemini API returned empty candidate content');
        return null;
      }

      const parsed: T = JSON.parse(rawText);
      return parsed;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.warn(`Gemini API request timed out after ${timeoutMs}ms`);
      } else {
        logger.warn(`Gemini API call failed: ${err.message}`);
      }
      return null;
    }
  }
}
