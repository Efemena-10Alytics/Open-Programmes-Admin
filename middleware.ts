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

  // Only redirect to signin if accessing protected route without session
  // Don't redirect back to dashboard from signin - let user stay on signin page
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};