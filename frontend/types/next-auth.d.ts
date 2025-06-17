import "next-auth";

declare module "next-auth" {
  // Extending built in session type
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }

  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    sub?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    sub?: string;
  }
}
