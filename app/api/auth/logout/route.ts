import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = cookies();
  
  // Delete all auth related cookies
  cookieStore.delete("admin_session");
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
  cookieStore.delete("next-auth.callback-url");
  cookieStore.delete("next-auth.csrf-token");
  
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get("callbackUrl") || "/auth/signin";
  
  // Build absolute URL for redirect
  const redirectUrl = new URL(callbackUrl, request.url);
  
  return NextResponse.redirect(redirectUrl);
}
