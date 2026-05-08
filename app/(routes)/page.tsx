import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/utils/api-address";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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
  ArrowRight,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import { SessionForm } from "@/components/modals/sessionForm";

type overviewType = {
  title: string;
  category: any[];
  route: string;
};

// Refined icon mapping for all dashboard modules
const getCardIcon = (title: string) => {
  const iconMap: { [key: string]: any } = {
    users: Users,
    courses: BookOpen,
    cohorts: LayoutDashboard,
    blogs: FileText,
    facilitators: GraduationCap,
    reports: FileText,
    analytics: BarChart3,
    activities: Activity,
    products: ShoppingBag,
    orders: Target,
    sales: BarChart3,
    "course-change-requests": RefreshCw,
    classroom: GraduationCap,
    payments: CreditCard,
    "program-leads": Users,
    default: LayoutDashboard,
  };
  const key = title.toLowerCase();
  return iconMap[key] || iconMap.default;
};

export default async function Home() {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    return redirect("/auth/signin");
  }

  let overviewData: overviewType[] = [];
  let programLeadsCount = 0;
  let facilitatorsCount = 0;
  let courseChangeRequestsCount = 0;
  let pendingChangeRequestsCount = 0;

  try {
    const headers = { Authorization: `Bearer ${session.accessToken}` };
    
    // Fetch multiple metrics to ensure factual correctness
    const [overviewRes, facilitatorsRes, leadsRes, crRes] = await Promise.all([
      axios.get(`${APIURL}/api/overview`, { headers }),
      axios.get(`${APIURL}/api/facilitators`, { headers }),
      axios.get(`${APIURL}/api/program-leads/count`, { headers }),
      axios.get(`${APIURL}/api/admin/change-requests/count`, { headers })
    ]);

    if (overviewRes.status === 200) {
      overviewData = overviewRes.data?.data;
    }

    if (facilitatorsRes.status === 200) {
      // Correctly fetch real facilitator count from its own API
      facilitatorsCount = facilitatorsRes.data?.data?.length || 0;
    }

    if (leadsRes.status === 200) {
      programLeadsCount = leadsRes.data?.data.reduce(
        (sum: number, item: { _count: { programType: number } }) => sum + item._count.programType,
        0
      );
    }

    if (crRes.status === 200) {
      courseChangeRequestsCount = crRes.data?.data.total || 0;
      pendingChangeRequestsCount = crRes.data?.data.pending || 0;
    }
  } catch (error: any) {
    console.error("Dashboard data fetch error:", error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
      return redirect("/auth/signin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight lg:text-4xl">
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Welcome, <span className="font-semibold text-primary">{session.user?.name}</span>. Manage your platform metrics here.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SessionForm />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* 1. Dynamic Overview Data Cards (Users, Courses, Cohorts, Blogs) */}
          {overviewData.map((data, index) => (
            <DashboardCard 
              key={index}
              title={data.title}
              value={data?.category?.length || 0}
              subtitle="Total count"
              link={data.route}
            />
          ))}

          {/* 2. Specialized Management Cards */}
          <DashboardCard 
            title="Sales Dashboard"
            value="Analytics"
            subtitle="Reports & Revenue"
            link="/sales"
            customIcon={BarChart3}
            isSpecial
          />

          <DashboardCard 
            title="Payment System"
            value="Payments"
            subtitle="Real-time monitoring"
            link="/payments"
            customIcon={CreditCard}
            isSpecial
          />

          <DashboardCard 
            title="Classroom"
            value="LMS"
            subtitle="Course Content"
            link="/classroom"
            customIcon={GraduationCap}
            isSpecial
          />

          {/* 3. Metrics/Counter Cards */}
          <DashboardCard 
            title="Facilitators"
            value={facilitatorsCount}
            subtitle={facilitatorsCount === 1 ? "instructor" : "instructors"}
            link="/facilitators"
          />

          <DashboardCard 
            title="Program Leads"
            value={programLeadsCount}
            subtitle="Prospects"
            link="/program-leads"
          />

          <DashboardCard 
            title="Change Requests"
            value={courseChangeRequestsCount}
            subtitle={pendingChangeRequestsCount > 0 ? `${pendingChangeRequestsCount} pending` : "Total requests"}
            link="/change-requests"
            badge={pendingChangeRequestsCount > 0 ? "Pending" : null}
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, subtitle, link, customIcon, isSpecial, badge }: any) {
  const Icon = customIcon || getCardIcon(title);
  
  return (
    <Link href={link} className="group">
      <Card className="h-full border-gray-200 bg-white shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">
                {title}
              </CardDescription>
              <CardTitle className={`font-bold text-gray-900 leading-tight ${typeof value === 'string' ? 'text-2xl' : 'text-4xl'}`}>
                {value}
              </CardTitle>
            </div>
            <div className={`p-3 rounded-xl transition-all duration-300 ${isSpecial ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 uppercase tracking-wide">
              {subtitle}
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </p>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase">
                {badge}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
