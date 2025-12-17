import { getServerSession } from "next-auth";
import { options } from "../../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/colums";
import { Facilitator } from "@/types";

export default async function FacilitatorsPage() {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    return redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let facilitators: Facilitator[] = [];

  try {
    const facilitatorsRes = await axiosInstance.get(`/api/facilitators`);
    if (facilitatorsRes.status === 200) {
      facilitators = facilitatorsRes.data?.data || [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Facilitators
              </h1>
              <p className="text-gray-600">
                Manage all instructors and their course assignments
              </p>
            </div>
            <Link href="/facilitators/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Facilitator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DataTable columns={columns} data={facilitators} />
        </div>
      </div>
    </div>
  );
}
