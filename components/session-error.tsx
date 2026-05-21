"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface SessionErrorProps {
  title?: string;
  message?: string;
  showLink?: boolean;
}

export function SessionExpiredError({
  title = "Session Expired",
  message = "Your session has expired. Please sign in again to continue.",
  showLink = true,
}: SessionErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        {showLink && (
          <CardContent>
            <Link
              href="/auth/signin"
              className="inline-block w-full text-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Sign In
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
