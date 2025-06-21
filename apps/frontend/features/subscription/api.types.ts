export interface ISubscriptionResponse {
  orgId: number;
  plan: "trial" | "pro";
  expiresAt: Date;
  status: "active" | "inactive" | "expired";
  reviewsRemaining: number;
}
