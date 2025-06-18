export interface IReview {
  code: string;
  provider: "GEMINI" | "CLAUDE";
}

export interface IReviewResponse {
  review: string;
}
