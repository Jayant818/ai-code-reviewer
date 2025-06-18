// useAuth Hook - Updated
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
} from "../cookies";
import axios from "axios";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  // Check token validity on mount and when session changes
  useEffect(() => {
    const validateToken = async () => {
      const accessToken = getAccessTokenFromCookie();

      if (!accessToken) {
        setIsTokenValid(false);
        return;
      }

      try {
        // Optional: Make a lightweight request to validate token
        await axios.get("http://localhost:3001/auth/validate", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setIsTokenValid(true);

        // If we have a valid token but no session, update the session
        if (status !== "authenticated" || !session?.accessToken) {
          await update();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsTokenValid(false);

        // Try to refresh the token if validation fails
        try {
          // await axios.get("http://localhost:3001/auth/refreshToken", {
          //   withCredentials: true,
          // });

          // Check if refresh was successful
          const newToken = getAccessTokenFromCookie();
          if (newToken) {
            setIsTokenValid(true);
            await update();
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }
    };

    validateToken();
  }, [session, status, update]);

  const login = async () => {
    window.location.href = "http://localhost:3001/auth/github/login";
  };

  const logout = async () => {
    try {
      // Call your NestJS logout endpoint to clear cookies
      await fetch("http://localhost:3001/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      // Then sign out from NextAuth
      await signOut({ redirect: false });

      // Clear any remaining cookies client-side
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect even if logout fails
      router.push("/");
    }
  };

  // Determine authentication status from both NextAuth session and token validity
  const isAuthenticated =
    (status === "authenticated" && !!session?.accessToken) ||
    isTokenValid === true;

  // Loading state is true when NextAuth is loading OR we're still validating the token
  const isLoading = status === "loading" || isTokenValid === null;

  return {
    session,
    status: isAuthenticated
      ? "authenticated"
      : isLoading
      ? "loading"
      : "unauthenticated",
    isAuthenticated,
    isLoading,
    login,
    logout,
    user: session?.user,
  };
}
