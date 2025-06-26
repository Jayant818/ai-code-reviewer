import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getIntegration } from "./integration.api";
import { IGetOrgIntegrationResponse } from "./integration.types";
import { APIError, ValidationError } from "@/lib/errors";

const integrationKeys = {
  getOrgIntegration: ["orgIntegration"],
};

export const useGetOrgIntegrationQuery = ({
  customConfig,
}: {
  customConfig?: Partial<
    UseQueryOptions<IGetOrgIntegrationResponse, APIError | ValidationError>
  >;
} = {}) => {
  const response = useQuery<
    IGetOrgIntegrationResponse,
    APIError | ValidationError
  >({
    queryKey: integrationKeys.getOrgIntegration,
    queryFn: getIntegration,
    throwOnError: true,
    ...customConfig,
  });
  return response;
};
