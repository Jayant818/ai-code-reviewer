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
  totalComments: z.number(),
  totalBugs: z.number(),
  breakdown: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    info: z.number(),
  }),
});

export type IReviewAnalyticsResponse = z.infer<typeof ReviewAnalyticsSchema>;

export const RecentReview = z
  .object({
    _id: z.string(),
    repositoryName: z.string(),
    pullRequestTitle: z.string(),
    pullRequestUrl: z.string(),
    author: z.string(),
    reviewRequestedAt: z.string(),
    status: z.enum(["pending", "completed", "rejected"]),
    aiProvider: z.enum(["gemini", "claude"]),
    issueCounts: z.object({
      critical: z.number(),
      high: z.number(),
      medium: z.number(),
      low: z.number(),
      info: z.number(),
    }),
  })
  .optional();

export const RecentReviewsSchema = z.array(RecentReview);

export type IRecentReviews = z.infer<typeof RecentReviewsSchema>;
