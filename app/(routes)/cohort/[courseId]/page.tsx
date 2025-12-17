import { options } from "@/app/api/auth/[...nextauth]/options";
import { CohortType } from "@/types";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/colums";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

interface CohortCourseIdPageProps {
  params: {
    courseId: string;
  };
}

const CohortCourseIdPage = async ({ params }: CohortCourseIdPageProps) => {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let cohorts: CohortType[] = [];
  let cohortsByCourseId: CohortType[] = [];

  try {
    await axiosInstance.get(`/api/cohorts`).then((response) => {
      if (response && response.status === 200) {
        cohorts = response.data?.data;
      }
    });
  } catch (error) {
    console.log("Something went wrong while fetching cohorts", error);
  }

  cohortsByCourseId = cohorts?.filter(
    (cohort) => cohort.courseId === params?.courseId
  );

  return (
    <div className="p-6">
      <>
        {" "}
        <div className="flex items-center justify-between">
          <Heading
            title={`Cohort (${cohortsByCourseId?.length})`}
            description="Manage cohorts for your application"
          />
        </div>
        <Separator className="my-5" />
        <DataTable
          columns={columns}
          data={cohortsByCourseId}
          courseId={params?.courseId}
        />
      </>
    </div>
  );
};

export default CohortCourseIdPage;
