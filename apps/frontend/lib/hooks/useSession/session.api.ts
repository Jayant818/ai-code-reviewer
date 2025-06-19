import { sessionAxiosInstance } from "@/lib/axios/axiosInstance";
import { ISession, IUpdateSessionResponse } from "./useSession.types";

export const getClientSession = async () => {
  const response = await sessionAxiosInstance.get<ISession>("/session");
  return response.data;
};

export const createClientSession = async (
  payload: ISession
): Promise<IUpdateSessionResponse> => {
  const response = await sessionAxiosInstance.post("/session", payload);
  return response.data;
};

export const deleteClientSession = async () => {
  const response = await sessionAxiosInstance.delete("/session");
  return response.data;
};
