export interface ISession {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
  };
}

export interface IUseSession {
  onSetSessionSuccess?: () => void;
  onSetSessionError?: () => void;
  onDeleteSessionSuccess?: () => void;
  onDeleteSessionError?: () => void;
}

export interface IDeleteSessionResponse {
  message: string;
}

export interface IUpdateSessionResponse {
  message: string;
}
