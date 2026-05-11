export { default } from "next-auth/middleware"

//This is for pages that require authentications
export const config = { 
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"] 
};