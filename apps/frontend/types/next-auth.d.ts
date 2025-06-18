// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      org?: string;
    };
  }

  interface User {
    id: string;
    name?: string;
    email?: string;
    org?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    org?: string;
  }
}
