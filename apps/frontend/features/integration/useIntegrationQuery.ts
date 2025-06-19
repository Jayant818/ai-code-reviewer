import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getIntegration } from "./integration.api";
import { IErrorResponse } from "@/types/error.types";
import { IOrgIntegrationResponse } from "./integration.types";

const integrationKeys = {
  getOrgIntegration: (orgId: string) => ["orgIntegration", orgId],
};

export const useGetOrgIntegrationQuery = ({
  orgId,
  customConfig,
}: {
  orgId: string;
  customConfig?: Partial<
    UseQueryOptions<IOrgIntegrationResponse, IErrorResponse>
  >;
}) => {
  const response = useQuery<IOrgIntegrationResponse, IErrorResponse>({
    queryKey: integrationKeys.getOrgIntegration(orgId),
    queryFn: () => getIntegration(orgId),
    ...customConfig,
  });
  return response;
};
