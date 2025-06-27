import {
  IReviewInput,
  IReviewResponse,
  RecentReviewsSchema,
  ReviewAnalyticsSchema,
  ReviewInputSchema,
  ReviewResponseSchema,
} from "./api.types";
import axios from "../../lib/axios/axiosInstance";
import { APIError, ValidationError } from "@/lib/errors";

export const getReview = async ({
  code,
  provider,
}: IReviewInput): Promise<IReviewResponse> => {
  try {
    const inputCheck = ReviewInputSchema.safeParse({
      code,
      provider,
    });

    if (!inputCheck.success) {
      throw new ValidationError("Invalid review request", inputCheck.error);
    }

    const response = await axios.post("/ai/review", {
      code,
      provider,
    });

    const result = ReviewResponseSchema.safeParse(response.data);

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
  try {
    const response = await axios.get("/reviews/analytics");

    const result = ReviewAnalyticsSchema.safeParse(response.data);

    if (!result.success) {
      console.error("API response error in review analytics:", result);
      throw new ValidationError(
        "Invalid API response format in Review analytics",
        result.error
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      "An unexpected error occurred while fetching analytics",
      500,
      error
    );
  }
};

export const getRecentReviews = async () => {
  try {
    const response = await axios.get("/reviews/recent");

    const result = RecentReviewsSchema.safeParse(response.data);

    if (!result.success) {
      console.error("API response error:", result.error);
      throw new ValidationError(
        "Invalid API response format in recent reviews",
        result.error
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      "An unexpected error occurred while fetching recent reviews",
      500,
      error
    );
  }
};
