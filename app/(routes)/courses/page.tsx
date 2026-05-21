import { DataTable } from "./_components/data-table";
import { columns } from "./_components/colums";
import { CourseType } from "@/types";
import { getServerSession } from "@/lib/auth-server";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { AddCourseModal } from "@/components/modals/add-new-course-modal";
import { SessionExpiredError } from "@/components/session-error";

const CoursesPage = async () => {
  const session = await getServerSession();

  if (!session?.accessToken) {
    return <SessionExpiredError />;
  }

  setAuthToken(session?.accessToken);

  let courses: CourseType[] = [];

  try {
    const response = await axiosInstance.get(`/api/courses`, {
      headers: { Authorization: `Bearer ${session?.accessToken}` }
    });
    if (response && response.status === 200) {
      courses = response.data?.data;
    }
  } catch (error: any) {
    console.log("Something went wrong while fetching courses", error);
    // Don't redirect on errors - let page render with empty data
    courses = [];
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
