import axios from "../../lib/axios/axiosInstance";
import { ILoggedInUser } from "./api.types";

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
export const getCurrentUser = async (): Promise<ILoggedInUser> => {
  const response = await axios.get<ILoggedInUser>("/user/current");

  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  data: Partial<UserData>
): Promise<UserResponse> => {
  const token = getAccessToken();

  const response = await axios.patch<UserResponse>("/user/profile", data);

  return response.data;
};

/**
 * Get user dashboard stats
 */
export const getDashboardStats = async () => {
  const response = await axios.get("/user/dashboard/stats");

  return response.data;
};

/**
 * Get user recent activity
 */
export const getRecentActivity = async () => {
  const response = await axios.get("/user/dashboard/activity");

  return response.data;
};
