import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { redirect } from "next/navigation";
import { CourseWeekType } from "@/types";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { axiosInstance } from "@/utils/axios";

const WeeksPage = async ({
  params,
}: {
  params: {
    courseId: string;
  };
}) => {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }


  let weeks: CourseWeekType[] = [];
  
  try {
    await axiosInstance
      .get(`/api/courses/${params?.courseId}/weeks`)
      .then((response) => {
        if (response && response.status === 200) {
          weeks = response.data?.data;
        }
      });
  } catch (error) {
    console.log("Something went wrong while fetching course weeks:", error);
  }

  return (
    <div className="py-4 lg:p-6">
      <DataTable courseId={params?.courseId} columns={columns} data={weeks} />
    </div>
  );
};

export default WeeksPage;
