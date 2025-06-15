import { subscriptionAPI } from "@/src/api-functions";
import { IErrorResponse } from "@/types/error.types";
import {
  SubscriptionRequest,
  SubscriptionResponse,
} from "@/features/subscription/subscription.api";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  current: () => [...subscriptionKeys.all, "current"] as const,
};

/**
 * Hook to get current subscription
 */
export const useCurrentSubscription = (
  options?: UseQueryOptions<SubscriptionResponse, IErrorResponse>
) => {
  return useQuery<SubscriptionResponse, IErrorResponse>({
    queryKey: subscriptionKeys.current(),
    queryFn: subscriptionAPI.getCurrentSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to create/update subscription
 */
export const useSubscriptionMutation = (
  options?: UseMutationOptions<
    SubscriptionResponse,
    IErrorResponse,
    SubscriptionRequest
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionResponse, IErrorResponse, SubscriptionRequest>(
    {
      mutationFn: subscriptionAPI.createSubscription,
      onSuccess: (data) => {
        // Update the current subscription cache
        queryClient.setQueryData(subscriptionKeys.current(), data);
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      },
      ...options,
    }
  );
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = (
  options?: UseMutationOptions<SubscriptionResponse, IErrorResponse, void>
) => {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionResponse, IErrorResponse, void>({
    mutationFn: subscriptionAPI.cancelSubscription,
    onSuccess: (data) => {
      // Update the current subscription cache
      queryClient.setQueryData(subscriptionKeys.current(), data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
    ...options,
  });
};
