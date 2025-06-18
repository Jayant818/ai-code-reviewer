import { AUTH_TOKENS } from "./auth";

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const cookies = document.cookie.split(";");
  console.log("Cookies", cookies);
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1);
    }
  }
  return undefined;
}

export function getAccessTokenFromCookie(): string | undefined {
  return getCookie(AUTH_TOKENS.ACCESS_TOKEN);
}

/**
 * Get the refresh token from cookies
 */
export function getRefreshTokenFromCookie(): string | undefined {
  return getCookie(AUTH_TOKENS.REFRESH_TOKEN);
}

/**
 * Set a cookie with the given name, value and options
 */
export function setCookie(
  name: string,
  value: string,
  options: any = {}
): void {
  if (typeof document === "undefined") return;

  const cookieOptions = {
    path: "/",
    ...options,
  };

  let cookieString = `${name}=${value}`;

  if (cookieOptions.expires) {
    if (typeof cookieOptions.expires === "number") {
      const days = cookieOptions.expires;
      const t = (cookieOptions.expires = new Date());
      t.setTime(t.getTime() + days * 24 * 60 * 60 * 1000);
    }
    cookieString += `;expires=${cookieOptions.expires.toUTCString()}`;
  }

  if (cookieOptions.path) {
    cookieString += `;path=${cookieOptions.path}`;
  }

  if (cookieOptions.domain) {
    cookieString += `;domain=${cookieOptions.domain}`;
  }

  if (cookieOptions.secure) {
    cookieString += ";secure";
  }

  if (cookieOptions.sameSite) {
    cookieString += `;samesite=${cookieOptions.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
  setCookie(name, "", { expires: -1 });
}
