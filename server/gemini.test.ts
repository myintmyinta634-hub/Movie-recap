import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Gemini API Configuration", () => {
  it("should have GEMINI_API_KEY configured in environment", () => {
    expect(ENV.geminiApiKey).toBeDefined();
    expect(ENV.geminiApiKey).not.toBe("");
    expect(ENV.geminiApiKey.length).toBeGreaterThan(10);
  });

  it("should validate Gemini API key format", () => {
    const key = ENV.geminiApiKey;
    // Gemini API keys contain alphanumeric characters, dots, underscores, and hyphens
    expect(key).toMatch(/^[a-zA-Z0-9._-]+$/);
  });
});
