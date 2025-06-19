import { IErrorResponse } from "@/types/error.types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  IDeleteSessionResponse,
  ISession,
  IUpdateSessionResponse,
  IUseSession,
} from "./useSession.types";
import {
  createClientSession,
  deleteClientSession,
  getClientSession,
} from "./session.api";

const sessionKeys = {
  getSessionKey: ["session"],
  deleteSessionKey: ["deleteSession"],
  createSessionKey: ["createSession"],
  postSessionKey: ["usePostSession"],
};

export const useSessionQuery = ({
  customConfig,
}: {
  customConfig?: UseQueryOptions<ISession, IErrorResponse>;
} = {}) => {
  const sessionData = useQuery<ISession, IErrorResponse>({
    queryKey: sessionKeys.getSessionKey,
    queryFn: getClientSession,
    ...customConfig,
  });

  return sessionData;
};

export const useDeleteSessionMutation = ({
  customConfig,
}: {
  customConfig?: UseMutationOptions<IDeleteSessionResponse, IErrorResponse>;
} = {}) => {
  const responseData = useMutation<IDeleteSessionResponse, IErrorResponse>({
    mutationFn: deleteClientSession,
    mutationKey: sessionKeys.deleteSessionKey,
    ...customConfig,
  });

  return responseData;
};

export const usePostSessionMutation = ({
  customConfig,
}: {
  customConfig?: UseMutationOptions<
    IUpdateSessionResponse,
    IErrorResponse,
    ISession
  >;
}) => {
  const responseData = useMutation<
    IUpdateSessionResponse,
    IErrorResponse,
    ISession
  >({
    mutationFn: (payload: ISession) => createClientSession(payload),
    mutationKey: sessionKeys.postSessionKey,
    ...customConfig,
  });

  return responseData;
};

export const useSession = (config?: IUseSession) => {
  const sessionData = useSessionQuery();

  const { mutate: setSession } = usePostSessionMutation({
    customConfig: {
      onSuccess: config?.onSetSessionSuccess || (() => {}),
      onError: config?.onSetSessionError || (() => {}),
    },
  });

  const { mutate: deleteSession } = useDeleteSessionMutation({
    customConfig: {
      onSuccess: config?.onDeleteSessionSuccess || (() => {}),
      onError: config?.onDeleteSessionError || (() => {}),
    },
  });

  return {
    setSession,
    deleteSession,
    ...sessionData,
    session: sessionData.data,
  };
};
