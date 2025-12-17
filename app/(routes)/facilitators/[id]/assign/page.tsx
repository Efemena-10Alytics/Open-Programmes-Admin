import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { Course, Facilitator } from "@/types";
import { AssignCoursesForm } from "../../_components/assign-courses-form";

export default async function AssignCoursesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    return redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let facilitator: Facilitator | null = null;
  let allCourses: Course[] = [];
  let assignedCourses: Course[] = [];

  try {
    const [facilitatorRes, coursesRes] = await Promise.all([
      axiosInstance.get(`/api/facilitators/${params.id}`),
      axiosInstance.get(`/api/courses`),
    ]);

    if (facilitatorRes && facilitatorRes.status === 200) {
      facilitator = facilitatorRes.data?.data || null;
      assignedCourses = facilitator?.courses || [];
    }

    if (coursesRes && coursesRes.status === 200) {
      allCourses = coursesRes.data?.data || [];
    }
  } catch (error) {
    console.log("Error fetching data", error);
  }

  if (!facilitator) {
    return redirect("/facilitators");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Assign Courses to {facilitator.name}
              </h1>
              <p className="text-gray-600">
                Manage which courses this facilitator teaches
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <AssignCoursesForm
            facilitatorId={facilitator.id}
            allCourses={allCourses}
            assignedCourses={assignedCourses}
          />
        </div>
      </div>
    </div>
  );
}