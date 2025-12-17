"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  BookOpen,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import { axiosInstance } from "@/utils/axios";
import { format } from "date-fns";
import { Skeleton } from "./_components/skeleton";

// Define types
interface User {
  id: string;
  name?: string;
  email?: string;
}

interface Payment {
  id: string;
  amount: number;
  paymentPlan: string;
  paymentDate: string;
  course: {
    title: string;
  };
}

interface UserPayment {
  user?: User;
  total: number;
  payments: Payment[];
}

interface MonthlySalesData {
  totalRevenue: number;
  userPayments: UserPayment[];
  period: {
    start: string;
    end: string;
  };
}

interface YearlySalesData {
  year: number;
  totalRevenue: number;
  totalTransactions: number;
  monthlyData: Array<{
    month: string;
    year: number;
    revenue: number;
    transactions: number;
  }>;
}

interface ProgramEnrollment {
  id: string;
  title: string;
  totalPurchases: number;
  activeEnrollments: number;
  cohorts: Array<{
    id: string;
    name: string;
    enrollments: number;
    startDate: string;
    endDate: string;
  }>;
}

interface DashboardData {
  summary: {
    currentRevenue: number;
    previousRevenue: number;
    growthPercentage: number;
    transactions: number;
    averageTransaction: number;
  };
  topCourses: Array<{
    id: string;
    title: string;
    revenue: number;
    enrollments: number;
  }>;
  paymentPlanDistribution: Array<{
    paymentPlan: string;
    count: number;
    revenue: number;
  }>;
  period: {
    type: string;
    current: {
      start: string;
      end: string;
    };
    previous: {
      start: string;
      end: string;
    };
  };
}

// Format currency in Naira
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Color palette for charts
const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

function SalesDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [timeRange, setTimeRange] = useState<"month" | "year">("month");

  // Automatically set to current month/year on component mount
  useEffect(() => {
    const currentDate = new Date();
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth() + 1);
  }, []);

  // Fetch dashboard summary data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["sales-dashboard", timeRange],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/api/admin/dashboard?period=${timeRange}`
      );
      return data as DashboardData;
    },
  });

  // Fetch monthly sales data
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["monthly-sales", selectedYear, selectedMonth],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/api/admin/monthly-sales?year=${selectedYear}&month=${selectedMonth}`
      );
      return data as MonthlySalesData;
    },
  });

  // Fetch yearly sales data
  const { data: yearlyData, isLoading: yearlyLoading } = useQuery({
    queryKey: ["yearly-sales", selectedYear],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/api/admin/yearly-sales?year=${selectedYear}`
      );
      return data as YearlySalesData;
    },
  });

  // Fetch program enrollment data
  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ["programs-enrollment"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/api/admin/programs-enrollment"
      );
      return data as ProgramEnrollment[];
    },
  });

  // Generate year options (current year and previous 5 years)
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: year.toString() };
  });

  // Generate month options
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  if (dashboardLoading || monthlyLoading || yearlyLoading || programsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNaira(dashboardData?.summary.currentRevenue || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {dashboardData?.summary.growthPercentage || 0 > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              {Math.abs(dashboardData?.summary.growthPercentage || 0).toFixed(
                1
              )}
              % from previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.summary.transactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatNaira(dashboardData?.summary.averageTransaction || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programsData?.reduce(
                (sum, program) => sum + program.activeEnrollments,
                0
              ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {programsData?.length || 0} programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium capitalize">{timeRange}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.period.current.start &&
                format(
                  new Date(dashboardData.period.current.start),
                  "MMM d, yyyy"
                )}{" "}
              -
              {dashboardData?.period.current.end &&
                format(
                  new Date(dashboardData.period.current.end),
                  "MMM d, yyyy"
                )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Sales</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Analysis</TabsTrigger>
          <TabsTrigger value="programs">Program Enrollment</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Month ({selectedYear})</CardTitle>
                <CardDescription>Monthly revenue trends</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData?.monthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        `₦${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₦${Number(value).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill={CHART_COLORS[0]}
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Plan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Plan Distribution</CardTitle>
                <CardDescription>Revenue by payment plan type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.paymentPlanDistribution || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      nameKey="paymentPlan"
                      label={({ paymentPlan, revenue }) =>
                        `${paymentPlan}: ${formatNaira(revenue)}`
                      }
                    >
                      {dashboardData?.paymentPlanDistribution.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `₦${Number(value).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>By revenue generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.enrollments} enrollments
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatNaira(course.revenue)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {course.enrollments > 0
                          ? formatNaira(course.revenue / course.enrollments)
                          : "₦0"}{" "}
                        avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Sales Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of sales for{" "}
                {monthOptions.find((m) => m.value === selectedMonth)?.label}{" "}
                {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem
                        key={year.value}
                        value={year.value.toString()}
                      >
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNaira(monthlyData?.totalRevenue || 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {monthlyData?.userPayments.length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Average per Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNaira(
                        monthlyData?.totalRevenue &&
                          monthlyData.userPayments.length
                          ? monthlyData.totalRevenue /
                              monthlyData.userPayments.length
                          : 0
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {monthlyData?.userPayments && monthlyData.userPayments.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Purchases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyData.userPayments.map((userPayment, index) => (
                        <div
                          key={userPayment.user?.id || `user-${index}`}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">
                                {userPayment.user?.name || 'Unknown Customer'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {userPayment.user?.email || 'No email available'}
                              </p>
                              {!userPayment.user && (
                                <p className="text-xs text-orange-500">User data not available</p>
                              )}
                            </div>
                            <Badge variant="outline">
                              {formatNaira(userPayment.total)}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {userPayment.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>{payment.course.title}</span>
                                <div className="flex items-center gap-2">
                                  <span>{formatNaira(payment.amount)}</span>
                                  <Badge variant="secondary">
                                    {payment.paymentPlan}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {format(
                                      new Date(payment.paymentDate),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Purchases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No sales data available for this period</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Analysis Tab */}
        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Sales Analysis</CardTitle>
              <CardDescription>
                Revenue trends for {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem
                        key={year.value}
                        value={year.value.toString()}
                      >
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNaira(yearlyData?.totalRevenue || 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Total Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {yearlyData?.totalTransactions || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Average per Transaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNaira(
                        yearlyData?.totalRevenue && yearlyData.totalTransactions
                          ? yearlyData.totalRevenue /
                              yearlyData.totalTransactions
                          : 0
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyData?.monthlyData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `₦${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `₦${Number(value).toLocaleString()}`,
                          "Revenue",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="transactions"
                        stroke={CHART_COLORS[1]}
                        strokeWidth={2}
                        name="Transactions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {yearlyData?.monthlyData.map((monthData) => (
                      <div
                        key={monthData.month}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{monthData.month}</h4>
                          <p className="text-sm text-muted-foreground">
                            {monthData.transactions} transactions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatNaira(monthData.revenue)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {monthData.transactions > 0
                              ? formatNaira(
                                  monthData.revenue / monthData.transactions
                                )
                              : "₦0"}{" "}
                            avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Program Enrollment Tab */}
        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Enrollment</CardTitle>
              <CardDescription>
                Active enrollments across all programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {programsData?.map((program) => (
                  <div key={program.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{program.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {program.totalPurchases} total purchases
                        </p>
                      </div>
                      <Badge variant="outline">
                        {program.activeEnrollments} active enrollments
                      </Badge>
                    </div>

                    {program.cohorts.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Cohorts:</h4>
                        {program.cohorts.map((cohort) => (
                          <div
                            key={cohort.id}
                            className="flex items-center justify-between text-sm pl-4"
                          >
                            <div>
                              <span>{cohort.name}</span>
                              <p className="text-muted-foreground">
                                {format(new Date(cohort.startDate), "MMM yyyy")}{" "}
                                -
                                {cohort.endDate
                                  ? format(new Date(cohort.endDate), "MMM yyyy")
                                  : "Present"}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {cohort.enrollments} students
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SalesDashboard;