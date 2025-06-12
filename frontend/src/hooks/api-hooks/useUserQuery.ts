import { userAPI } from "@/src/api-functions";
import { IErrorResponse } from "@/src/types/error.types";
import { UserData, UserResponse } from "@/src/api-functions/user.api";
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

export const userKeys = {
  all: ["user"] as const,
  current: () => [...userKeys.all, "current"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  activity: () => [...userKeys.all, "activity"] as const,
};

/**
 * Hook to get current user data
 */
export const useCurrentUser = (
  options?: UseQueryOptions<UserResponse, IErrorResponse>
) => {
  return useQuery<UserResponse, IErrorResponse>({
    queryKey: userKeys.current(),
    queryFn: userAPI.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateUserProfile = (
  options?: UseMutationOptions<UserResponse, IErrorResponse, Partial<UserData>>
) => {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, IErrorResponse, Partial<UserData>>({
    mutationFn: userAPI.updateUserProfile,
    onSuccess: (data) => {
      // Update the current user cache
      queryClient.setQueryData(userKeys.current(), data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    ...options,
  });
};

/**
 * Hook to connect Stripe account
 */
export const useConnectStripe = (
  options?: UseMutationOptions<{ url: string }, IErrorResponse, void>
) => {
  return useMutation<{ url: string }, IErrorResponse, void>({
    mutationFn: userAPI.connectStripeAccount,
    ...options,
  });
};

/**
 * Hook to disconnect Stripe account
 */
export const useDisconnectStripe = (
  options?: UseMutationOptions<UserResponse, IErrorResponse, void>
) => {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, IErrorResponse, void>({
    mutationFn: userAPI.disconnectStripeAccount,
    onSuccess: (data) => {
      // Update the current user cache
      queryClient.setQueryData(userKeys.current(), data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    ...options,
  });
};

/**
 * Hook to get dashboard stats
 */
export const useDashboardStats = (
  options?: UseQueryOptions<any, IErrorResponse>
) => {
  return useQuery<any, IErrorResponse>({
    queryKey: userKeys.stats(),
    queryFn: userAPI.getDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to get recent activity
 */
export const useRecentActivity = (
  options?: UseQueryOptions<any, IErrorResponse>
) => {
  return useQuery<any, IErrorResponse>({
    queryKey: userKeys.activity(),
    queryFn: userAPI.getRecentActivity,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};
