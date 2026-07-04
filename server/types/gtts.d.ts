declare module "gtts" {
  import { Readable } from "stream";

  interface GTTSOptions {
    text: string;
    lang?: string;
    slow?: boolean;
    host?: string;
    timeout?: number;
  }

  class gTTS {
    constructor(options: GTTSOptions);
    stream(): Readable;
    save(filepath: string, callback?: (err: Error | null) => void): void;
  }

  const gtts: typeof gTTS;
  export default gtts;
}
