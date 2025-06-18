import { headers } from "next/headers";
import axios from "./axios/axiosInstance";
import { FRONTEND_URL } from "./constants";

export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const response = await axios.post(
      "/auth/refreshToken",
      {
        refresh: JSON.stringify(oldRefreshToken),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data) {
      throw new Error("Failed to refresh token");
    }

    const { accessToken, refreshToken } = response.data;

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
