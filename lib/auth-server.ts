import { cookies } from "next/headers";

export async function getServerSession(...args: any[]) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;
  console.log('auth-server cookie:', sessionCookie);

  
  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(sessionCookie);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error parsing admin_session cookie in getServerSession:", error);
    return null;
  }
}
