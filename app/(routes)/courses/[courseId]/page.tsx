import IconBadge from "@/components/icon-badge";
import {
  Currency,
  LayoutDashboard,
  ListChecks,
  ListCollapse,
  Timer,
  UserPlus,
} from "lucide-react";
import { redirect } from "next/navigation";
import TitleForm from "./_components/title-form";
import DescriptionForm from "./_components/description-form.";
import ImageForm from "./_components/image-form";
import PriceForm from "./_components/price-form.";
import CourseActions from "./_components/course-actions";
import { CourseType } from "@/types";
import InstructorForm from "./_components/instructor-form";
import MiscellenousForm from "./_components/miscellaneous-form";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import TimeTableList from "./_components/timetable-list";

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

  return (
    <>
      <div className="pt-3 pb-6 lg:p-6">
        <div className="flex items-center justify-end">
          <CourseActions courseId={params?.courseId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl font-medium"> Customize your course </h2>
            </div>
            <TitleForm initialData={course} courseId={course?.id} />
            <DescriptionForm initialData={course} courseId={course?.id} />
            <ImageForm initialData={course} courseId={course?.id} />
            <>
              <div className="flex items-center gap-x-2 mt-6">
                <IconBadge icon={Timer} />
                <h2 className="text-xl"> Timetable </h2>
              </div>
              <TimeTableList initialData={course} courseId={course?.id} />
            </>
            <>
              <div className="flex items-center gap-x-2 mt-6">
                <IconBadge icon={ListCollapse} />
                <h2 className="text-xl"> Other Informations </h2>
              </div>
              <MiscellenousForm initialData={course} courseId={course?.id} />
            </>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Currency} />
              <h2 className="text-xl">Sell your course</h2>
            </div>
            <PriceForm initialData={course} courseId={course?.id} />

            <div className="space-y-6">
              <div className="flex items-center gap-x-2">
                <IconBadge icon={UserPlus} />
                <h2 className="text-xl"> Instructor Information </h2>
              </div>
              <InstructorForm initialData={course} courseId={course?.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;
