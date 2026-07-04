import { tts as edgeTts, getVoices as getEdgeVoices } from "edge-tts";
import gTTSModule from "gtts";
import { ENV } from "./_core/env";

const gTTS = gTTSModule as any;

export interface TTSVoice {
  id: string;
  name: string;
  gender: "male" | "female";
  engine: "edge-tts" | "gtts";
  language: string;
}

// Available Myanmar voices - only verified free voices
// Edge-TTS provides 2 native Myanmar voices
// gTTS provides 1 generic Myanmar voice (no gender variants available)
export const MYANMAR_VOICES: TTSVoice[] = [
  {
    id: "my-MM-NilarNeural",
    name: "Nilar",
    gender: "female",
    engine: "edge-tts",
    language: "my-MM",
  },
  {
    id: "my-MM-ThihaNeural",
    name: "Thiha",
    gender: "male",
    engine: "edge-tts",
    language: "my-MM",
  },
  {
    id: "gtts-my-default",
    name: "gTTS Myanmar",
    gender: "female",
    engine: "gtts",
    language: "my",
  },
];

export interface TTSOptions {
  voiceId: string;
  speed?: number; // 0.5 to 2.0
  pitch?: number; // -20 to 20
}

/**
 * Convert speed multiplier to edge-tts rate format
 * Edge-tts uses: +0% (1.0x), +50% (1.5x), -50% (0.5x), etc.
 */
function speedToRate(speed: number): string {
  const percentage = (speed - 1) * 100;
  return percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
}

/**
 * Convert pitch value to edge-tts pitch format
 * Edge-tts uses: +0Hz, +10Hz, -10Hz, etc.
 */
function pitchToEdgePitch(pitch: number): string {
  return pitch >= 0 ? `+${pitch}Hz` : `${pitch}Hz`;
}

/**
 * Generate speech audio using Edge-TTS
 */
async function generateEdgeTTS(
  text: string,
  voiceId: string,
  speed: number = 1.0,
  pitch: number = 0
): Promise<Buffer> {
  const rate = speedToRate(speed);
  const pitchStr = pitchToEdgePitch(pitch);

  const buffer = await edgeTts(text, {
    voice: voiceId,
    rate: rate,
    pitch: pitchStr,
  });

  return buffer;
}

/**
 * Generate speech audio using gTTS
 * Note: gTTS does not support speed or pitch adjustments
 */
async function generateGTTS(text: string): Promise<Buffer> {
  const gtts = new gTTS({
    text: text,
    lang: "my",
  });

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = gtts.stream();

    stream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", (error: Error) => {
      reject(error);
    });
  });
}

/**
 * Generate TTS audio from text
 */
export async function generateTTS(
  text: string,
  options: TTSOptions
): Promise<Buffer> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  // Validate speed
  const speed = Math.max(0.5, Math.min(2.0, options.speed || 1.0));
  const pitch = Math.max(-20, Math.min(20, options.pitch || 0));

  const voice = MYANMAR_VOICES.find((v) => v.id === options.voiceId);
  if (!voice) {
    throw new Error(`Voice ${options.voiceId} not found`);
  }

  try {
    if (voice.engine === "edge-tts") {
      return await generateEdgeTTS(text, voice.id, speed, pitch);
    } else {
      // gTTS does not support speed/pitch, use default
      return await generateGTTS(text);
    }
  } catch (error) {
    console.error(`TTS generation failed for voice ${options.voiceId}:`, error);
    // Fallback to gTTS if Edge-TTS fails
    if (voice.engine === "edge-tts") {
      console.warn("Falling back to gTTS");
      return await generateGTTS(text);
    }
    throw error;
  }
}

/**
 * Get available voices
 */
export function getAvailableVoices(): TTSVoice[] {
  return MYANMAR_VOICES;
}
