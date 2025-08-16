import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { connectSlack, getIntegration } from "./integration.api";
import {
  getSlackConnectUrlResponse,
  IGetOrgIntegrationResponse,
} from "./integration.types";
import { APIError, ValidationError } from "@/lib/errors";

const integrationKeys = {
  getOrgIntegration: ["orgIntegration"],
  getSlackConnectUrl: ["slackConnectUrl"],
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

export const connectToSlackQuery = ({
  customConfig,
}: {
  customConfig?: UseQueryOptions<
    getSlackConnectUrlResponse,
    APIError | ValidationError
  >;
}) => {
  const response = useQuery<
    getSlackConnectUrlResponse,
    APIError | ValidationError
  >({
    queryKey: integrationKeys.getSlackConnectUrl,
    queryFn: connectSlack,
    throwOnError: true,
    ...customConfig,
  });
  return response;
};
