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
    await axiosInstance
      .get(`/api/courses/${params?.courseId}`)
      .then((response) => {
        if (response && response.status === 200) {
          course = response.data?.data;
        }
      });
  } catch (error) {
    console.log("Something went wrong while fetching course:", error);
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
