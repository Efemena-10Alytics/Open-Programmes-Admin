import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseType } from "@/types";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { CourseCard } from "./_components/course-card";

const CoHortPage = async () => {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  let courses: CourseType[] = [];

  try {
    await axiosInstance.get(`/api/courses`).then((response) => {
      if (response && response.status === 200) {
        courses = response.data?.data;
      }
    });
  } catch (error) {
    console.log("Something went wrong while fetching courses", error);
  }

  return (
    <div className="py-4 lg:p-6">
      <div className="flex items-center space-x-5 w-full flex-wrap">
        {courses?.map((course, index) => (
          <CourseCard key={course?.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CoHortPage;
