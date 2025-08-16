import { z } from "zod";

export const SubscriptionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  githubId: z.number(),
  Model: z.enum(["gemini", "claude"]),
  reviewsLeft: z.number(),
  status: z.enum(["active", "inactive", "expired"]),
  subscription: z
    .object({
      _id: z.string(),
      plan: z.enum(["trial", "pro"]),
      billingPeriod: z.enum(["monthly", "yearly"]),
      expiresAt: z.string(), // should be a date string
    })
    .optional(),
});

export type ISubscriptionResponse = z.infer<typeof SubscriptionSchema>;

export const createSubscriptionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  url: z.string().optional(),
  transactionId:z.string().optional(),
});

export type ICreateSubscriptionResponse = z.infer<
  typeof createSubscriptionResponseSchema
>;

export const SubscriptionRequestSchema = z.object({
  type: z.enum(["trial", "pro"]),
});

export type SubscriptionRequest = z.infer<typeof SubscriptionRequestSchema>;
