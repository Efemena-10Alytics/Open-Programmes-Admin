import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProgramLeadsDataTable } from "./_components/program-leads-data-table";
import { ExportProgramLeadsModal } from "./_components/export-program-leads-modal";

const ProgramLeadsPageLoading = () => {
  return (
    <div className="py-4 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
      <Separator className="my-5" />
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  );
};

const ProgramLeadsPage = async () => {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let programTypes: string[] = [];
  let initialLeads: any[] = [];

  try {
    const [typesResponse, leadsResponse] = await Promise.all([
      axiosInstance.get(`/api/program-leads/count`),
      axiosInstance.get(`/api/program-leads`),
    ]);

    if (typesResponse.status === 200) {
      programTypes = typesResponse.data?.data.map((item: any) => item.programType);
    }
    if (leadsResponse.status === 200) {
      initialLeads = leadsResponse.data?.data;
    }
  } catch (error: any) {
    console.error("Error fetching data", error);
  }

  return (
    <div className="py-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Program Leads"
          description="Manage and track program leads"
        />
        <div className="flex items-center space-x-2">
          <ExportProgramLeadsModal programTypes={programTypes} />
        </div>
      </div>
      <Separator className="my-5" />
      <ProgramLeadsDataTable initialData={initialLeads} programTypes={programTypes} />
    </div>
  );
};

export default function ProgramLeadsPageWrapper() {
  return (
    <Suspense fallback={<ProgramLeadsPageLoading />}>
      <ProgramLeadsPage />
    </Suspense>
  );
}