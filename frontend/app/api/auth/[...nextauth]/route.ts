import { AUTH_TOKENS } from "@/lib/auth";
import NextAuth, { AuthOptions } from "next-auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// JWT secret from your environment
const JWT_SECRET =
  "b130d24e52498308bc99a8c12f7be8cc6f00e37461b7f89568b1c88f5aba58f7";

export const NEXT_AUTH_CONFIG: AuthOptions = {
  providers: [
    {
      id: "github",
      name: "Github",
      type: "oauth",
      authorization: {
        url: "http://localhost:3001/auth/github/login",
      },
      profile() {
        // This won't be called
        return { id: "", name: "", email: "" };
      },
    },
  ],
  callbacks: {
    async jwt({ token }) {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(AUTH_TOKENS.ACCESS_TOKEN);
        const refreshToken = cookieStore.get(AUTH_TOKENS.REFRESH_TOKEN);

        console.log("JWT Callback - Access Token:", !!accessToken);
        console.log("JWT Callback - Refresh Token:", !!refreshToken);

        // If we have an access token in cookies, use it
        if (accessToken) {
          token.accessToken = accessToken.value;

          try {
            // Decode the JWT to extract user information
            const decoded = jwt.verify(accessToken.value, JWT_SECRET) as any;
            console.log("Decoded token:", decoded);

            // Update token with decoded information
            token.sub = decoded.sub;
          } catch (error) {
            console.error("Error decoding JWT:", error);
          }
        }

        if (refreshToken) {
          token.refreshToken = refreshToken.value;
        }
      } catch (error) {
        console.error("Error in JWT callback:", error);
      }

      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Token:", token);

      try {
        if (token) {
          session.accessToken = token.accessToken;
          session.refreshToken = token.refreshToken;

          // Initialize user object if it doesn't exist
          session.user = session.user || {};
          session.user.id = token.sub || "";

          // // If we have a decoded token with more user info, add it
          // if (token.name) session.user.name = token.name;
          // if (token.email) session.user.email = token.email;
          // if (token.org) session.user.org = token.org;
        }
      } catch (error) {
        console.error("Error in session callback:", error);
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(NEXT_AUTH_CONFIG);

export { handler as GET, handler as POST };
