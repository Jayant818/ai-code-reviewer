import { IErrorResponse } from "@/types/error.types";
import {
  createSubscription,
  getOrgSubscription,
  SubscriptionRequest,
} from "@/features/subscription/subscription.api";
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  ICreateSubscriptionResponse,
  ISubscriptionResponse,
} from "./api.types";
import { APIError, ValidationError } from "@/lib/errors";

export const subscriptionKeys = {
  all: ["subscription"],
  current: ["current"],
};

export const useGetOrgSubscriptionQuery = ({
  customConfig,
}: {
  customConfig?: Omit<
    UseQueryOptions<ISubscriptionResponse, IErrorResponse>,
    "queryKey"
  >;
} = {}) => {
  const response = useQuery<ISubscriptionResponse, IErrorResponse>({
    queryKey: subscriptionKeys.current,
    queryFn: getOrgSubscription,
    throwOnError: true,
    ...customConfig,
  });

  return response;
};

export const useSubscriptionMutation = ({
  customConfig,
}: {
  customConfig?: UseMutationOptions<
    ICreateSubscriptionResponse,
    ValidationError | APIError,
    SubscriptionRequest
  >;
}) => {
  const response = useMutation<
    ICreateSubscriptionResponse,
    ValidationError | APIError,
    SubscriptionRequest
  >({
    mutationKey: subscriptionKeys.current,
    mutationFn: (data: SubscriptionRequest) => createSubscription(data),
    throwOnError: true,
    ...customConfig,
  });

  return response;
};
