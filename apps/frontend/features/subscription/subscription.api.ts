import axios from "../../lib/axios/axiosInstance";
import { ISubscriptionResponse } from "./api.types";

export interface SubscriptionRequest {
  type: "free" | "pro";
}

export interface SubscriptionResponse {
  success: boolean;
  data: {
    subscriptionId: string;
    type: "free" | "pro";
    status: "active" | "pending" | "cancelled";
    startDate: string;
    endDate?: string;
    paymentUrl?: string;
  };
  message?: string;
}

/**
 * Create or update subscription
 */
export const createSubscription = async (
  data: SubscriptionRequest
): Promise<SubscriptionResponse> => {
  const response = await axios.post<SubscriptionResponse>(
    "/organization/subscription",
    data
  );

  return response.data;
};

export const getOrgSubscription = async (
  orgId: string
): Promise<ISubscriptionResponse> => {
  const response = await axios.get<ISubscriptionResponse>(
    `/organization/subscription?orgId=${orgId}`
  );

  return response.data;
};
