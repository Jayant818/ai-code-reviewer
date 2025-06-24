import { IErrorResponse } from "@/types/error.types";
import { IReview, IReviewResponse } from "@/features/review/api.types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  getRecentReviews,
  getReview,
  getReviewHistory,
  getReviewsAnalytics,
} from "./review.api";

export const reviewKeys = {
  getReview: ["get-review"],
  getReviewAnalytics: ["get-review-analytics"],
  getReviewHistory: ["get-review-history"],
};

export const useGetReviewMutation = ({
  customConfig,
}: {
  customConfig?: UseMutationOptions<
    IReviewResponse,
    IErrorResponse,
    IReview,
    unknown
  >;
} = {}) => {
  const mutation = useMutation<
    IReviewResponse,
    IErrorResponse,
    IReview,
    unknown
  >({
    mutationFn: ({ code, provider }) => getReview({ code, provider }),
    mutationKey: reviewKeys.getReview,
    ...customConfig,
  });

  return mutation;
};

export const useGetReviewsAnalyticsQuery = ({
  customConfig,
}: {
  customConfig?: UseQueryOptions<any, IErrorResponse>;
} = {}) => {
  const response = useQuery<any, IErrorResponse>({
    queryKey: reviewKeys.getReviewAnalytics,
    queryFn: getReviewsAnalytics,
    ...customConfig,
  });

  return response;
};

export const useGetRecentReviewQuery = ({
  customConfig,
}: {
  customConfig?: UseQueryOptions<any, IErrorResponse>;
} = {}) => {
  const response = useQuery<any, IErrorResponse>({
    queryKey: reviewKeys.getReviewHistory,
    queryFn: getRecentReviews,
    ...customConfig,
  });
  return response;
};
