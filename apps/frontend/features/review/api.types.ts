import { z } from "zod";

export const ReviewSchema = z.object({
  code: z.string(),
  provider: z.enum(["GEMINI", "CLAUDE"]),
});

export type IReview = z.infer<typeof ReviewSchema>;
