import { BACKEND_URL, FRONTEND_URL } from "./constants";

export const refreshToken = async (oldRefreshToken: string) => {
  try {
    console.log("Calling refresh token");
    console.log("Old refresh token", oldRefreshToken);
    console.log("Backend URL", BACKEND_URL);
    console.log("Frontend URL", FRONTEND_URL);
    const response = await fetch(`${BACKEND_URL}/auth/refreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: oldRefreshToken,
      }),
    });

    const data = await response.json();

    if (!data) {
      throw new Error("Failed to refresh token");
    }

    const { accessToken, refreshToken } = data;

    // update session with new token
    // we can only update the cookie in server action or route handler
    // so we are using fetch to update the cookie
    const updatedSession = await fetch(`${FRONTEND_URL}/api/auth/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });

    if (!updatedSession.ok) {
      throw new Error("Failed to update session token");
    }

    return accessToken;
  } catch (err) {
    console.log("Error refreshing token", err);
    return null;
  }
};
