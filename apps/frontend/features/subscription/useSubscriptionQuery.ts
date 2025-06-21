import { IErrorResponse } from "@/types/error.types";
import {
  cancelSubscription,
  createSubscription,
  getCurrentSubscription,
  getOrgSubscription,
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
import { ISubscriptionResponse } from "./api.types";

export const subscriptionKeys = {
  all: ["subscription"],
  current: (orgId: string | null) => ["current", orgId],
};

export const useGetOrgSubscriptionQuery = ({
  orgId,
  customConfig,
}: {
  orgId: string | null;
  customConfig?: Omit<
    UseQueryOptions<ISubscriptionResponse, IErrorResponse>,
    "queryKey"
  >;
}) => {
  const response = useQuery<ISubscriptionResponse, IErrorResponse>({
    queryKey: subscriptionKeys.current(orgId),
    queryFn: () => {
      if (!orgId) {
        throw new Error("Organization ID is required");
      }
      return getOrgSubscription(orgId);
    },
    ...customConfig,
  });

  return response;
};

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
      mutationFn: (data: SubscriptionRequest) => createSubscription(data),
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
