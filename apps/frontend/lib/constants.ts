export const EXPIRES_IN = new Date(Date.now() + 1 * 60 * 60 * 1000);

export const BACKEND_URL = process.env.BACKEND_URL;
export const FRONTEND_URL = process.env.FRONTEND_URL;

export const AUTH_TOKENS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_ID: "userId",
  NAME: "name",
} as const;
