"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { setAuthToken } from "@/utils/axios";

function TokenSetter({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

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
