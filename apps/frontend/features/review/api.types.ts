import { z } from "zod";

export const ReviewInputSchema = z.object({
  code: z.string(),
  provider: z.enum(["GEMINI", "CLAUDE"]),
});

export const ReviewResponseSchema = z.object({
  review: z.string(),
});

export type IReviewInput = z.infer<typeof ReviewInputSchema>;

export type IReviewResponse = z.infer<typeof ReviewResponseSchema>;

export const ReviewAnalyticsSchema = z.object({
  totalReviews: z.number(),
});

export type IReviewAnalyticsResponse = z.infer<typeof ReviewAnalyticsSchema>;
