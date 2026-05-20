"use client";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Reads the admin_session cookie, extracts the JWT token, parses its payload, and returns a session object.
 * Returns { data: null } if no valid token is present.
 */
export const useSession = () => {
  if (typeof window === "undefined") {
    return { data: null };
  }
  const match = document.cookie.match(/admin_session=([^;]+)/);
  if (!match) return { data: null };
  try {
    const token = decodeURIComponent(match[1]);
    // JWT format: header.payload.signature
    const payloadPart = token.split(".")[1] ?? "";
    const payloadJson = atob(payloadPart);
    const payload = JSON.parse(payloadJson);
    const user = {
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
    // Ensure axios uses this token for future requests
    setAuthToken(token);
    return { data: { user, accessToken: token } };
  } catch (e) {
    console.error("Failed to parse admin_session token", e);
    return { data: null };
  }
};

// Keep legacy signIn / signOut signatures for compatibility (optional no-ops)
export const signIn = async (provider: string, opts: any) => {
  console.warn("signIn called but auth is handled via Axios in LoginForm.");
  return { ok: false, status: 401 };
};

export const signOut = async () => {
  // Remove cookie
  document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  setAuthToken(undefined);
};
