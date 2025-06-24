import { IReview, IReviewResponse } from "./api.types";
import axios from "../../lib/axios/axiosInstance";

export const getReview = async ({
  code,
  provider,
}: IReview): Promise<IReviewResponse> => {
  const response = await axios.post<IReviewResponse>("/ai/review", {
    code,
    provider,
  });

  return response.data;
};

export const getReviewsAnalytics = async () => {
  const response = await axios.get("/reviews/analytics");

  return response.data;
};

export const getRecentReviews = async () => {
  const response = await axios.get("/reviews/recent");
  return response.data;
};
