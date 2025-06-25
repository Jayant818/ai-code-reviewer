import { z } from "zod";

export const SubscriptionSchema = z.object({
  _id: z.number(),
  name: z.enum(["trial", "pro"]),
  githubId: z.number(),
  Model: z.string(),
  reviewsLeft: z.number(),
  status: z.enum(["active", "inactive", "expired"]),
  subscription: z
    .object({
      _id: z.string(),
      plan: z.enum(["trial", "pro"]),
      billingPeriod: z.enum(["monthly", "yearly"]),
      expiresAt: z.date(),
    })
    .optional(),
});

export type ISubscriptionResponse = z.infer<typeof SubscriptionSchema>;

export const createSubscriptionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ICreateSubscriptionResponse = z.infer<
  typeof createSubscriptionResponseSchema
>;

export const SubscriptionRequestSchema = z.object({
  type: z.enum(["free", "pro"]),
});

export type SubscriptionRequest = z.infer<typeof SubscriptionRequestSchema>;
