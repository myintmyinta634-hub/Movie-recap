import { ENV } from "./_core/env";

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  language: string;
}

/**
 * Translate text to Myanmar using Google Gemini API
 */
export async function translateToMyanmar(
  text: string
): Promise<TranslationResult> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  if (!ENV.geminiApiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not configured. Please set it before using the translation feature."
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate the following text to Myanmar (Burmese) language. Only provide the translated text without any explanation or additional content:\n\n${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Invalid GEMINI_API_KEY. Please check your API key configuration."
        );
      }

      throw new Error(
        `Gemini API error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      throw new Error("Invalid response from Gemini API");
    }

    const translatedText = data.candidates[0].content.parts[0].text.trim();

    return {
      originalText: text,
      translatedText: translatedText,
      language: "my",
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Translation failed: ${String(error)}`);
  }
}
