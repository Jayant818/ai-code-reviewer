import axios from "../lib/axios/axiosInstance";
import { getAccessToken } from "../lib/auth";

export interface UserData {
  username: string;
  email: string;
  githubId: number;
  avatar: string;
  stripeAccountId: string | null;
}

export interface UserResponse {
  success: boolean;
  data: UserData;
  message?: string;
}

/**
 * Get current user data
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  const token = getAccessToken();
  
  const response = await axios.get<UserResponse>("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: Partial<UserData>): Promise<UserResponse> => {
  const token = getAccessToken();
  
  const response = await axios.patch<UserResponse>("/user/profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Connect Stripe account
 */
export const connectStripeAccount = async (): Promise<{ url: string }> => {
  const token = getAccessToken();
  
  const response = await axios.post<{ url: string }>("/user/stripe/connect", {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Disconnect Stripe account
 */
export const disconnectStripeAccount = async (): Promise<UserResponse> => {
  const token = getAccessToken();
  
  const response = await axios.delete<UserResponse>("/user/stripe/disconnect", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Get user dashboard stats
 */
export const getDashboardStats = async () => {
  const token = getAccessToken();
  
  const response = await axios.get("/user/dashboard/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Get user recent activity
 */
export const getRecentActivity = async () => {
  const token = getAccessToken();
  
  const response = await axios.get("/user/dashboard/activity", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
