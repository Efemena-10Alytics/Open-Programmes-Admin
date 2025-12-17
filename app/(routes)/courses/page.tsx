import { DataTable } from "./_components/data-table";
import { columns } from "./_components/colums";
import { redirect } from "next/navigation";
import { CourseType } from "@/types";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { AddCourseModal } from "@/components/modals/add-new-course-modal";

const CoursesPage = async () => {
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
    <div className="p-6">
      <>
        <div className="flex items-center justify-start">
          <Heading
            title={`Courses (${courses?.length})`}
            description="Manage courses for your application"
          />
        </div>
        <Separator className="my-5" />
        <AddCourseModal />
      </>
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursesPage;
