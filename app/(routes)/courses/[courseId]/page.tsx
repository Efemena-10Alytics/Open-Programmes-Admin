import { redirect } from "next/navigation";
import { CourseType } from "@/types";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import CourseEditWizard from "./_components/course-edit-wizard";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let course: CourseType = null!;

  try {
    const response = await axiosInstance.get(`/api/courses/${params?.courseId}`, {
      headers: { Authorization: `Bearer ${session?.accessToken}` }
    });
    if (response && response.status === 200) {
      course = response.data?.data;
    }
  } catch (error: any) {
    console.log("Something went wrong while fetching course:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      redirect("/auth/signin");
    }
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <>
      <CourseEditWizard course={course} />
    </>
  );
};

export default CourseIdPage;
