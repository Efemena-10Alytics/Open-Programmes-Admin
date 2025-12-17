import IconBadge from "@/components/icon-badge";
import { Clapperboard, LayoutDashboard, Puzzle } from "lucide-react";
import { redirect } from "next/navigation";
import TitleForm from "./_components/module-title-form";
import DescriptionForm from "./_components/module-description-form.";
import ImageForm from "./_components/module-image-form";
import { ModuleType, ProjectVideoType, QuizType } from "@/types";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import ModuleActions from "./_components/module-actions";
import CourseVideoList from "./_components/course-video-list";


const ModuleIdPage = async ({
  params,
}: {
  params: { courseId: string; weekId: string; moduleId: string };
}) => {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  let courseModule: ModuleType = null!;
  let courseVideos: ProjectVideoType[] = [];
  let courseQuizzes: QuizType[] = [];

  try {
    await axiosInstance
      .get(
        `/api/courses/${params?.courseId}/weeks/${params?.weekId}/modules/${params?.moduleId}`
      )
      .then((response) => {
        if (response && response.status === 200) {
          courseModule = response.data?.data;
        }
      });
  } catch (error) {
    console.log("Something went wrong while fetching module:", error);
  }

  courseVideos = courseModule?.projectVideos!;
  courseQuizzes = courseModule?.quizzes!;

  return (
    <>
      <div className="pt-3 pb-6 lg:p-6">
        <div className="flex items-center justify-end">
          <ModuleActions
            courseId={params?.courseId}
            moduleId={params?.moduleId}
            weekId={params?.weekId}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl font-medium">
                {" "}
                Customize: {courseModule?.title}{" "}
              </h2>
            </div>
            <TitleForm
              initialData={courseModule}
              courseId={params?.courseId}
              moduleId={params?.moduleId}
              weekId={params?.weekId}
            />
            <DescriptionForm
              initialData={courseModule}
              courseId={params?.courseId}
              moduleId={params?.moduleId}
              weekId={params?.weekId}
            />
            <ImageForm
              initialData={courseModule}
              courseId={params?.courseId}
              moduleId={params?.moduleId}
              weekId={params?.weekId}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Clapperboard} />
                <h2 className="text-xl">Course Videos</h2>
              </div>
              <div className="mt-6">
                <CourseVideoList
                  courseVideos={courseVideos}
                  courseId={params?.courseId}
                  moduleId={params?.moduleId}
                  weekId={params?.weekId}
                />
              </div>
            </div>
     
          </div>
        </div>
      </div>
    </>
  );
};

export default ModuleIdPage;
