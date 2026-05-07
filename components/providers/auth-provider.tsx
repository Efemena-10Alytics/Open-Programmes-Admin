"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import React, { useEffect } from "react";
import { setAuthToken } from "@/utils/axios";

function TokenSetter({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleUnauthorized = () => {
      console.log("🚫 [TokenSetter] Unauthorized detected, signing out...");
      signOut({ callbackUrl: "/auth/signin" });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:unauthorized", handleUnauthorized);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
      }
    };
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      console.log("🔐 Setting auth token from AuthProvider");
      setAuthToken(session.accessToken);
    } else if (status === "unauthenticated") {
      console.log("🔓 Removing auth token - user unauthenticated");
      setAuthToken(undefined);
    }
  }, [session?.accessToken, status]);

  return <>{children}</>;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <TokenSetter>{children}</TokenSetter>
    </SessionProvider>
  );
}
