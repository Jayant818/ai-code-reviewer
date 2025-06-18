import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKENS } from "./lib/auth";

const publicRoutes = ["/", "/plans", "/try", "/auth/callback/github"];

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(path);

  // check for authentication cookie
  const accessToken = req.cookies.get(AUTH_TOKENS.ACCESS_TOKEN)?.value;

  const isAuthenticated = !!accessToken;

  // redirected to home
  if (!isPublicRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAuthenticated && isPublicRoute && path !== "/") {
    return NextResponse.next();
  }

  if (path === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
