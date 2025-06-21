import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getIntegration } from "./integration.api";
import { IErrorResponse } from "@/types/error.types";
import { IOrgIntegrationResponse } from "./integration.types";

const integrationKeys = {
  getOrgIntegration: ["orgIntegration"],
};

export const useGetOrgIntegrationQuery = ({
  customConfig,
}: {
  customConfig?: Partial<
    UseQueryOptions<IOrgIntegrationResponse, IErrorResponse>
  >;
}={}) => {
  const response = useQuery<IOrgIntegrationResponse, IErrorResponse>({
    queryKey: integrationKeys.getOrgIntegration,
    queryFn: getIntegration,
    ...customConfig,
  });
  return response;
};
