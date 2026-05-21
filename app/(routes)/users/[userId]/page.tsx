import React from "react";
import { CourseType, User } from "@/types";
import { axiosInstance } from "@/utils/axios";
import axios from "axios";
import { APIURL } from "@/utils/api-address";
import { getServerSession } from "@/lib/auth-server";
import UserComponent from "./_components/user-components";
import { EngagementTabs } from "./_components/engagement-tabs";
import { SessionExpiredError } from "@/components/session-error";

interface UserPageProps {
  params: {
    userId: string;
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const session = await getServerSession();

  if (!session?.accessToken) {
    return <SessionExpiredError />;
  }

  let user: User | null = null;
  let courses: CourseType[] = [];

  console.log(`👤 [UserPage] Fetching data for userId: ${params.userId}`);
  console.log(`👤 [UserPage] Session present:`, !!session);
  console.log(`👤 [UserPage] AccessToken present:`, !!session?.accessToken);

  try {
    const [userResponse, coursesResponse] = await Promise.all([
      axios.get(`${APIURL}/api/users/${params.userId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      }),
      axios.get(`${APIURL}/api/courses`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      }),
    ]);

    user = userResponse.status === 200 ? userResponse.data?.data : null;
    courses = coursesResponse.status === 200 ? coursesResponse.data?.data : [];
  } catch (error: any) {
    console.error("❌ Failed to fetch data:", error.message);
    if (error.response) {
      console.error("❌ Response Status:", error.response.status);
      console.error("❌ Response Data:", error.response.data);
    }
    // Don't redirect on errors - continue with null data
  }



  if (!user) {
    return (
      <div className=" h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-gray-500">The user you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-6 lg:pt-12">
      <div className="w-full flex flex-col lg:flex-row lg:justify-between gap-5">
        <div className="w-full overflow-hidden flex justify-center border-b lg:border-b-0 lg:border-r border-gray-800 h-full py-5 lg:py-0">
          <picture>
            <img
              src={user.image || "/img/profile.png"}
              alt={user.name || "User profile"}
              className="lg:h-96 lg:w-96 2xl:h-[450px] 2xl:w-[450px] h-full w-full object-cover rounded-full brightness-75"
            />
          </picture>
        </div>
        <div className="w-full flex justify-start">
          <UserComponent data={user} courses={courses} />
        </div>
      </div>
      <div className="w-full mt-12">
        <h2 className="text-2xl font-bold mb-6">Student Engagement Tracking</h2>
        <EngagementTabs userId={params.userId} />
      </div>
    </div>
  );
}
