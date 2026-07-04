import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { translateToMyanmar } from "./translation";
import { generateTTS, getAvailableVoices } from "./tts";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  movieRecap: router({
    getVoices: publicProcedure.query(() => getAvailableVoices()),
    translate: publicProcedure
      .input(z.object({ text: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return await translateToMyanmar(input.text);
      }),
    generateTTS: publicProcedure
      .input(
        z.object({
          text: z.string().min(1),
          voiceId: z.string(),
          speed: z.number().min(0.5).max(2.0).optional(),
          pitch: z.number().min(-20).max(20).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = await generateTTS(input.text, {
          voiceId: input.voiceId,
          speed: input.speed,
          pitch: input.pitch,
        });
        return {
          audio: buffer.toString("base64"),
          mimeType: "audio/mpeg",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
