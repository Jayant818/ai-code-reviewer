export const EXPIRES_IN = new Date(Date.now() + 1 * 60 * 60 * 1000);

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

export const AUTH_TOKENS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_ID: "userId",
  NAME: "name",
} as const;

export const GITHUB_APP = process.env.NEXT_PUBLIC_GITHUB_APP;

export const SUPPORT_EMAIL = "yadavjayant2003@gmail.com";

export const GITHUB_ISSUES =
  "https://github.com/jayant818/ai-code-reviewer/issues";
