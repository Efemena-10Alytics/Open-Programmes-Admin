import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value;
  const { pathname } = request.nextUrl;

  // Public paths that do not require authentication
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".");

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (session && pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};