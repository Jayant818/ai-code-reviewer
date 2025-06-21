import { IErrorResponse } from "@/types/error.types";
import {
  createSubscription,
  getOrgSubscription,
  SubscriptionRequest,
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
  current: ["current"],
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
    queryKey: subscriptionKeys.current,
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

export const useSubscriptionMutation = ({
  customConfig,
}: {
  customConfig?: UseMutationOptions<any, IErrorResponse, SubscriptionRequest>;
}) => {
  const response = useMutation<any, IErrorResponse, SubscriptionRequest>({
    mutationKey: subscriptionKeys.current,
    mutationFn: (data: SubscriptionRequest) => createSubscription(data),
    ...customConfig,
  });

  return response;
};
