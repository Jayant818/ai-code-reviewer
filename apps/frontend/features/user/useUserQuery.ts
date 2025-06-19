import { IErrorResponse } from "@/types/error.types";
import {
  getCurrentUser,
  UserData,
  UserResponse,
} from "@/features/user/user.api";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ILoggedInUser } from "./api.types";

export const userKeys = {
  all: ["user"] as const,
  getCurrentUserDetails: () => ["current-user-details"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  activity: () => [...userKeys.all, "activity"] as const,
};

export const useGetCurrentUserDetailQuery = (
  customConfig?: UseQueryOptions<ILoggedInUser, IErrorResponse>
) => {
  return useQuery<ILoggedInUser, IErrorResponse>({
    queryKey: userKeys.getCurrentUserDetails(),
    queryFn: () => getCurrentUser(),
    ...customConfig,
  });
};

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
