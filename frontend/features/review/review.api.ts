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
