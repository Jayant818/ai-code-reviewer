import { AUTH_TOKENS } from "@/lib/auth";
import NextAuth, { AuthOptions } from "next-auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  "b130d24e52498308bc99a8c12f7be8cc6f00e37461b7f89568b1c88f5aba58f7";

export const NEXT_AUTH_CONFIG: AuthOptions = {
  providers: [
    {
      id: "github-custom",
      name: "GitHub Custom",
      type: "credentials",
      credentials: {},
      async authorize() {
        try {
          const cookieStore = await cookies();
          const accessToken = cookieStore.get(AUTH_TOKENS.ACCESS_TOKEN);
          const refreshToken = cookieStore.get(AUTH_TOKENS.REFRESH_TOKEN);

          console.log("Authorize - Access Token:", !!accessToken);
          console.log("Authorize - Refresh Token:", !!refreshToken);

          if (accessToken) {
            try {
              // Decode the JWT to extract user information
              const decoded = jwt.verify(accessToken.value, JWT_SECRET) as any;
              console.log("Decoded token in authorize:", decoded);

              return {
                id: decoded.sub,
                name: decoded.name || "",
                email: decoded.email || "",
                org: decoded.org || "",
                accessToken: accessToken.value,
                refreshToken: refreshToken?.value || "",
              };
            } catch (error) {
              console.error("Error decoding JWT in authorize:", error);
              return null;
            }
          }
          return null;
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      // If user object exists (from authorize), update token
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.org = user.org;
      } else {
        // Check for updated tokens in cookies
        try {
          const cookieStore = await cookies();
          const accessToken = cookieStore.get(AUTH_TOKENS.ACCESS_TOKEN);

          if (accessToken && accessToken.value !== token.accessToken) {
            try {
              const decoded = jwt.verify(accessToken.value, JWT_SECRET) as any;
              token.accessToken = accessToken.value;
              token.sub = decoded.sub;
              token.name = decoded.name;
              token.email = decoded.email;
              token.org = decoded.org;
            } catch (error) {
              console.error("Error updating token from cookie:", error);
            }
          }

          const refreshToken = cookieStore.get(AUTH_TOKENS.REFRESH_TOKEN);
          if (refreshToken) {
            token.refreshToken = refreshToken.value;
          }
        } catch (error) {
          console.error("Error checking cookies in JWT callback:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.user = {
          id: token.sub || "",
          name: token.name || "",
          email: token.email || "",
          org: token.org || "",
        };
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(NEXT_AUTH_CONFIG);
export { handler as GET, handler as POST };
