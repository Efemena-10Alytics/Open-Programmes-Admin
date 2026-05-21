import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { UsersClient } from "./_components/users-client";
import { Separator } from "@/components/ui/separator";
import { SessionExpiredError } from "@/components/session-error";
import { Loader2 } from "lucide-react";

const UsersPage = async () => {
  const session = await getServerSession();

  // Middleware protects this page, but check anyway for safety
  if (!session?.accessToken) {
    return <SessionExpiredError />;
  }

  // Set token for axios requests
  setAuthToken(session?.accessToken);

  let courses: any[] = [];
  let cohorts: any[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const [coursesResponse, cohortsResponse] = await Promise.all([
      axiosInstance.get(`/api/courses`, { 
        signal: controller.signal,
        timeout: 30000,
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      }),
      axiosInstance.get(`/api/cohorts`, { 
        signal: controller.signal,
        timeout: 30000,
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      })
    ]);

    clearTimeout(timeoutId);

    if (coursesResponse.status === 200) {
      courses = coursesResponse.data?.data;
    }
    if (cohortsResponse.status === 200) {
      cohorts = cohortsResponse.data?.data;
    }
  } catch (error: any) {
    console.error("Error fetching data", error);
    // Don't redirect on errors - let page render with empty data
    courses = [];
    cohorts = [];
  }

  return (
    <UsersClient courses={courses} cohorts={cohorts} />
  );
};

// Loading component
const UsersPageLoading = () => {
  return (
    <div className="py-4 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
      <Separator className="my-5" />
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  );
};

export default function UsersPageWrapper() {
  return (
    <Suspense fallback={<UsersPageLoading />}>
      <UsersPage />
    </Suspense>
  );
}