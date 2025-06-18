import { AxiosError } from "axios";

export interface IErrorServerResponse {
  errorId: string;
  statusCode: number;
  errorType: string;
  errorMessage?: string;
  redirectTo?: string;
}

export type IErrorResponse = AxiosError<IErrorServerResponse>;
