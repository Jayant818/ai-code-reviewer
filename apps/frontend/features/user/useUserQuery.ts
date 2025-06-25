import { IErrorResponse } from "@/types/error.types";
import { getCurrentUser } from "@/features/user/user.api";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { IUser } from "./user.schema";
import { APIError, ValidationError } from "@/lib/errors";

export const userKeys = {
  all: ["user"] as const,
  getCurrentUserDetails: () => ["current-user-details"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  activity: () => [...userKeys.all, "activity"] as const,
};

export const useGetCurrentUserDetailQuery = (
  customConfig?: UseQueryOptions<IUser, APIError | ValidationError>
) => {
  return useQuery<IUser, APIError | ValidationError>({
    queryKey: userKeys.getCurrentUserDetails(),
    queryFn: () => getCurrentUser(),
    throwOnError: true,
    ...customConfig,
  });
};
