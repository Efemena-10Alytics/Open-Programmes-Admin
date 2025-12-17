import IconBadge from "@/components/icon-badge";
import {
  FolderCheck,
  LayoutDashboard,
  StretchHorizontal,
  Puzzle
} from "lucide-react";
import { redirect } from "next/navigation";
import { CourseWeekType, ModuleType, QuizType } from "@/types";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import AttachmentForm from "./_components/attachment-form";
import WeekForm from "./_components/week-form";
import WeekActions from "./_components/week-actions";
import ModuleList from "./_components/module-list";
import CourseQuizList from "./_components/course-quiz-list";

const WeekIdPage = async ({
  params,
}: {
  params: { courseId: string; weekId: string };
}) => {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  let courseWeek: CourseWeekType = null!;
  let weekModules: ModuleType[] = [];
  let weekQuizzes: QuizType[] = [];

  try {
    await axiosInstance
      .get(`/api/courses/${params?.courseId}/weeks/${params.weekId}`)
      .then((response) => {
        if (response && response.status === 200) {
          courseWeek = response.data?.data;
        }
      });
  } catch (error) {
    console.log("Error fetching course week:", error);
  }

  try {
    await axiosInstance
      .get(`/api/courses/${params?.courseId}/weeks/${params.weekId}/modules`)
      .then((response) => {
        if (response && response.status === 200) {
          weekModules = response.data?.data;
        }
      });
  } catch (error) {
    console.log("Error fetching week modules:", error);
  }

  try {
    await axiosInstance
      .get(`/api/quiz/week/${params.weekId}`)
      .then((response) => {
        if (response && response.status === 200) {
          weekQuizzes = response.data?.data;
        }
      });
  } catch (error) {
    console.log("Error fetching week quizzes:", error);
  }

  return (
    <>
      <div className="pt-3 pb-6 lg:p-6">
        <div className="flex items-center justify-end">
          <WeekActions courseId={params?.courseId} weekId={params?.weekId} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl font-medium capitalize">
                Customize {courseWeek?.title}
              </h2>
            </div>
            <WeekForm
              initialData={courseWeek}
              courseId={params?.courseId}
              weekId={params?.weekId}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={FolderCheck} />
                <h2 className="text-xl">Week Module</h2>
              </div>
              <div className="mt-6">
                <ModuleList
                  modules={weekModules}
                  courseId={params?.courseId}
                  weekId={params?.weekId}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={StretchHorizontal} />
                <h2 className="text-xl"> Resources </h2>
              </div>
              <AttachmentForm
                initialData={courseWeek}
                courseId={params?.courseId}
                weekId={params?.weekId}
              />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Puzzle} />
                <h2 className="text-xl">Week Quizzes</h2>
              </div>
              <div className="mt-6">
                <CourseQuizList
                  quizzes={weekQuizzes}
                  courseId={params?.courseId}
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

export default WeekIdPage;