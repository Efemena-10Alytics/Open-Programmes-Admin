import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  FileText,
  BarChart3,
  CreditCard,
  Activity,
  ShoppingBag,
  Target,
  Zap,
  RefreshCw,
  Currency,
} from "lucide-react";
import { SessionForm } from "@/components/modals/sessionForm";

type overviewType = {
  title: string;
  category: any[];
  route: string;
};

// Simplified icon mapping
const getCardIcon = (title: string) => {
  const iconMap: { [key: string]: any } = {
    users: Users,
    customers: Users,
    facilitators: Users,
    instructors: Users,
    reports: FileText,
    analytics: BarChart3,
    activities: Activity,
    products: ShoppingBag,
    orders: Target,
    sales: BarChart3,
    "course-change-requests": RefreshCw,
    default: Zap,
  };
  const key = title.toLowerCase();
  return iconMap[key] || iconMap.default;
};

export default async function Home() {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    return redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let overviewData: overviewType[] = [];
  let programLeadsCount = 0;
  let facilitatorsCount = 0;
  let courseChangeRequestsCount = 0;
  let pendingChangeRequestsCount = 0;

  try {
    const overviewResponse = await axiosInstance.get(`/api/overview`);
    if (overviewResponse && overviewResponse.status === 200) {
      overviewData = overviewResponse.data?.data;
      const facilitatorsData = overviewData.find(
        (d) => d.title === "facilitators"
      );
      facilitatorsCount = facilitatorsData?.category?.length || 0;
    }

    const leadsResponse = await axiosInstance.get(`/api/program-leads/count`);
    if (leadsResponse && leadsResponse.status === 200) {
      programLeadsCount = leadsResponse.data?.data.reduce(
        (sum: number, item: { _count: { programType: number } }) =>
          sum + item._count.programType,
        0
      );
    }

    const changeRequestsResponse = await axiosInstance.get(
      `/api/admin/change-requests/count`
    );
    if (changeRequestsResponse && changeRequestsResponse.status === 200) {
      courseChangeRequestsCount = changeRequestsResponse.data?.data.total || 0;
      pendingChangeRequestsCount =
        changeRequestsResponse.data?.data.pending || 0;
    }
  } catch (error) {
    console.log("Error fetching dashboard data", error);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor your key metrics and performance
              </p>
            </div>
            <SessionForm />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Render overview data cards */}
          {overviewData.map((data, index) => {
            const IconComponent = getCardIcon(data.title);

            return (
              <Link key={index} href={data.route} className="group">
                <Card className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardDescription className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wider">
                          {data.title}
                        </CardDescription>
                        <CardTitle className="text-4xl font-bold text-gray-900 mb-1">
                          {data?.category?.length || 0}
                        </CardTitle>
                        <p className="text-xs text-gray-500">Total items</p>
                      </div>
                      <div className="p-3 rounded-md bg-primary">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}

          {/* Sales Dashboard Card */}
          <Link href="/sales" className="group">
            <Card className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardDescription className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wider">
                      Sales Dashboard
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                      Analytics & Reports
                    </CardTitle>
                    <p className="text-xs text-gray-500">Revenue tracking</p>
                  </div>
                  <div className="p-3 rounded-md bg-primary">
                    <Currency className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Payments Card */}
          <Link href="/payments" className="group">
            <Card className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardDescription className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wider">
                      Payment System
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                      Track & Manage
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      Real-time monitoring
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-primary">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Classroom Management */}
          <Link href="/classroom" className="group">
            <Card className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardDescription className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wider">
                      Classroom Management
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                      Assignments & Grading
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      Manage student submissions
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-primary">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Facilitators */}
          <Link href="/facilitators" className="group">
            <Card className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardDescription className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wider">
                      Facilitators
                    </CardDescription>
                    <CardTitle className="text-4xl font-bold text-gray-900 mb-1">
                      {facilitatorsCount}
                    </CardTitle>
                    <p className="text-xs text-gray-500">Manage instructors</p>
                  </div>
                  <div className="p-3 rounded-md bg-primary">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Program Leads */}
          <Link href="/program-leads" className="group">
            <Card className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardDescription className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wider">
                      Program Leads
                    </CardDescription>
                    <CardTitle className="text-4xl font-bold text-gray-900 mb-1">
                      {programLeadsCount}
                    </CardTitle>
                    <p className="text-xs text-gray-500">Potential students</p>
                  </div>
                  <div className="p-3 rounded-md bg-primary">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Course Change Requests */}
          <Link href="/change-requests" className="group">
            <Card className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardDescription className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wider">
                      Course Change Requests
                    </CardDescription>
                    <CardTitle className="text-4xl font-bold text-gray-900 mb-1">
                      {courseChangeRequestsCount}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Total requests
                      </span>
                      {pendingChangeRequestsCount > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          {pendingChangeRequestsCount} pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-primary">
                    <RefreshCw className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
