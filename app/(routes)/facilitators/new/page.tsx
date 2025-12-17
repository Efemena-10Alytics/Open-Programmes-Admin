import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { FacilitatorForm } from "../_components/facilitator-form";
import { Course } from "@/types";

export default async function NewFacilitatorPage() {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    return redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let courses: Course[] = [];

  try {
    const response = await axiosInstance.get(`/api/courses`);
    if (response && response.status === 200) {
      courses =
        response.data?.data?.map((course: any) => ({
          id: course.id,
          title: course.title || `Course ${course.id}`,
        })) || [];

      console.log("Processed courses:", courses);
    }
  } catch (error) {
    console.log("Error fetching courses", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Add New Facilitator
              </h1>
              <p className="text-gray-600">
                Fill in the details to add a new instructor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <FacilitatorForm courses={courses} />
        </div>
      </div>
    </div>
  );
}
