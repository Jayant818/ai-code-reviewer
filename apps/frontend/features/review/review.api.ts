import { IReview, ReviewSchema } from "./api.types";
import axios from "../../lib/axios/axiosInstance";
import { APIError, ValidationError } from "@/lib/errors";

export const getReview = async ({
  code,
  provider,
}: IReview): Promise<IReview> => {
  try {
    const response = await axios.post("/ai/review", {
      code,
      provider,
    });

    const result = ReviewSchema.safeParse(response.data);

    if (!result.success) {
      throw new ValidationError("Invalid API response format", result.error);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new APIError("An unexpected error occurred", 500, error);
  }
};

export const getReviewsAnalytics = async () => {
  const response = await axios.get("/reviews/analytics");

  return response.data;
};

export const getRecentReviews = async () => {
  const response = await axios.get("/reviews/recent");
  return response.data;
};
