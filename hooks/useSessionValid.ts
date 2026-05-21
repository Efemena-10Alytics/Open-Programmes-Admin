"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

/**
 * Hook to check if user has a valid session
 * Returns { isValid, isLoading, user }
 * 
 * Usage:
 * const { isValid, isLoading } = useSessionValid();
 * if (!isLoading && !isValid) return <ErrorComponent />;
 */
export const useSessionValid = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      setIsValid(true);
      setIsLoading(false);
    } else {
      setIsValid(false);
      setIsLoading(false);
    }
  }, [session]);

  return {
    isValid,
    isLoading,
    user: session?.user,
    accessToken: session?.accessToken,
  };
};

/**
 * Hook to handle 401/403 errors and show error message
 * Usage:
 * const { isSessionExpired, clearError } = useSessionExpired();
 * if (isSessionExpired) return <ErrorComponent />;
 */
export const useSessionExpired = () => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const handleError = (error: any) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      setIsSessionExpired(true);
      return true;
    }
    return false;
  };

  const clearError = () => {
    setIsSessionExpired(false);
  };

  return { isSessionExpired, handleError, clearError };
};
