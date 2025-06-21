export interface ISubscriptionResponse {
  _id: number;
  name: "trial" | "pro";
  model: string;
  githubId:number,
  expiresAt: Date;
  status: "active" | "inactive" | "expired";
  reviewsLeft: number;
  subscription: {
    plan: "trial" | "pro";
    billingPeriod: "monthly" | "yearly";
    expiresAt: Date;
  }
}
