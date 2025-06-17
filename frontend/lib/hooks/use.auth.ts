import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      update();
    }
  }, [status, update]);

  const login = async () => {
    window.location.href = "http://localhost:3001/auth/github/login";
  };

  const logout = async () => {
    // Call your NestJS logout endpoint to clear cookies
    await fetch("http://localhost:3001/auth/logout", {
      method: "GET",
      credentials: "include",
    });

    // Then sign out from NextAuth
    await signOut({ redirect: false });
    router.push("/");
  };

  return {
    session,
    status,
    isAuthenticated: status === "authenticated" && !!session,
    isLoading: status === "loading",
    login,
    logout,
  };
}
