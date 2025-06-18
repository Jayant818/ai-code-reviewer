import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./lib/session";

const publicRoutes = ["/", "/plans", "/try", "/auth/callback/github"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(path);

  const cookieStore = await cookies();

  const cookie = cookieStore.get("session")?.value;

  const session = await decrypt(cookie);

  // redirected to home
  if (!isPublicRoute && !session?.user?.id) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (session && session?.user.id && isPublicRoute && path !== "/") {
    return NextResponse.next();
  }

  if (path === "/" && session) {
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
