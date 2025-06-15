import { reviewAPI } from "@/src/api-functions";
import { IErrorResponse } from "@/types/error.types";
import { IReview, IReviewResponse } from "@/features/review/api.types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export const reviewKeys = {
  getReview: ["get-review"],
  // Dynamic key
  getReviewForUser: (userId: string) => [...reviewKeys.getReview, userId],
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
    mutationFn: ({ code, provider }) => reviewAPI.getReview({ code, provider }),
    mutationKey: reviewKeys.getReview,
    ...customConfig,
  });

  return mutation;
};
