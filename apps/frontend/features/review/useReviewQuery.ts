import { IErrorResponse } from "@/types/error.types";
import {
  IRecentReviews,
  IReviewAnalyticsResponse,
  IReviewInput,
  IReviewResponse,
} from "@/features/review/api.types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { getRecentReviews, getReview, getReviewsAnalytics } from "./review.api";
import { APIError, ValidationError } from "@/lib/errors";

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
    ValidationError | APIError,
    IReviewInput
  >;
} = {}) => {
  const mutation = useMutation<
    IReviewResponse, // return data type
    ValidationError | APIError, // error type
    IReviewInput //variable passed to mutationFn
  >({
    mutationFn: ({ code, provider }) => getReview({ code, provider }),
    mutationKey: reviewKeys.getReview,
    throwOnError: true,
    ...customConfig,
  });

  return mutation;
};

export const useGetReviewsAnalyticsQuery = ({
  customConfig,
}: {
  customConfig?: UseQueryOptions<
    IReviewAnalyticsResponse,
    APIError | ValidationError
  >;
} = {}) => {
  const response = useQuery<
    IReviewAnalyticsResponse,
    APIError | ValidationError
  >({
    queryKey: reviewKeys.getReviewAnalytics,
    queryFn: getReviewsAnalytics,
    throwOnError: true,
    ...customConfig,
  });

  return response;
};

export const useGetRecentReviewQuery = ({
  customConfig,
}: {
  customConfig?: UseQueryOptions<IRecentReviews, APIError | ValidationError>;
} = {}) => {
  const response = useQuery<IRecentReviews, APIError | ValidationError>({
    queryKey: reviewKeys.getReviewHistory,
    queryFn: getRecentReviews,
    throwOnError: true,
    ...customConfig,
  });
  return response;
};
