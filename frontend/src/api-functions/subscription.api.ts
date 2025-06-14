import axios from "../lib/axios/axiosInstance";
import { getAccessToken } from "../lib/auth";

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
  const token = getAccessToken();

  const response = await axios.post<SubscriptionResponse>(
    "/organization/subscription",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/**
 * Get current subscription status
 */
export const getCurrentSubscription =
  async (): Promise<SubscriptionResponse> => {
    const token = getAccessToken();

    const response = await axios.get<SubscriptionResponse>(
      "/organization/subscription",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };

/**
 * Cancel subscription
 */
export const cancelSubscription = async (): Promise<SubscriptionResponse> => {
  const token = getAccessToken();

  const response = await axios.delete<SubscriptionResponse>(
    "/org/subscription",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
