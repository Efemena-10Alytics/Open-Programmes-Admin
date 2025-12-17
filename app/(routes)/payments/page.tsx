"use client";

import { useEffect, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Download, ArrowUpDown } from "lucide-react";
import { Payment, PaymentStatusType, PaymentPlan } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { axiosInstance } from "@/utils/axios";
import { useRouter } from "next/navigation";
import { DataTablePagination } from "./_components/pagination";
import { PaymentStats } from "./_components/stats";

const TOTAL_COURSE_FEE =
  Number(process.env.NEXT_PUBLIC_TOTAL_COURSE_FEE) || 250000;

const statusOptions = [
  { value: "COMPLETE", label: "Complete" },
  { value: "BALANCE_HALF_PAYMENT", label: "Balance Pending" },
  { value: "PENDING_SEAT_CONFIRMATION", label: "Pending Confirmation" },
  { value: "EXPIRED", label: "Expired" },
];

const paymentPlanOptions = [
  { value: "FULL_PAYMENT", label: "Full Payment" },
  { value: "FIRST_HALF_COMPLETE", label: "Two Installments" },
  { value: "THREE_INSTALLMENTS", label: "Three Installments" },
  { value: "FOUR_INSTALLMENTS", label: "Four Installments" },
];

function PaymentsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [paymentPlanFilter, setPaymentPlanFilter] = useState<string | undefined>();
  const [courseFilter, setCourseFilter] = useState<string | undefined>();
  const [cohortFilter, setCohortFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "admin-payments",
      page,
      limit,
      searchTerm,
      statusFilter,
      paymentPlanFilter,
      courseFilter,
      cohortFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(paymentPlanFilter && { paymentPlan: paymentPlanFilter }),
        ...(courseFilter && { courseId: courseFilter }),
        ...(cohortFilter && { cohortId: cohortFilter }),
      });

      const { data } = await axiosInstance.get(`/api/admin/payments?${params}`);
      return data;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/courses");
      return data.data;
    },
  });

  const { data: cohorts } = useQuery({
    queryKey: ["cohorts"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/cohorts");
      return data.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["payment-stats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/admin/payments/stats");
      return data;
    },
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getInstallmentStatus = (payment: Payment) => {
    if (!["THREE_INSTALLMENTS", "FOUR_INSTALLMENTS"].includes(payment.paymentPlan)) return null;
    
    const paidCount = payment.paymentInstallments.filter(i => i.paid).length;
    const totalCount = payment.paymentInstallments.length;
    
    return `${paidCount}/${totalCount} paid`;
  };

  const getAmountPaid = (payment: Payment) => {
    if (payment.paymentPlan === "FULL_PAYMENT") {
      return TOTAL_COURSE_FEE;
    }
    if (payment.paymentPlan === "FIRST_HALF_COMPLETE") {
      return payment.status === "COMPLETE" 
        ? TOTAL_COURSE_FEE 
        : TOTAL_COURSE_FEE / 2;
    }
    if (["THREE_INSTALLMENTS", "FOUR_INSTALLMENTS"].includes(payment.paymentPlan)) {
      return payment.paymentInstallments
        .filter(i => i.paid)
        .reduce((sum, i) => sum + i.amount, 0);
    }
    return 0;
  };

  const getStatusBadge = (status: PaymentStatusType) => {
    switch (status) {
      case "COMPLETE":
        return <Badge variant="success">Complete</Badge>;
      case "BALANCE_HALF_PAYMENT":
        return <Badge variant="warning">Balance Pending</Badge>;
      case "PENDING_SEAT_CONFIRMATION":
        return <Badge variant="secondary">Pending Confirmation</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentPlanBadge = (plan: PaymentPlan) => {
    switch (plan) {
      case "FULL_PAYMENT":
        return <Badge variant="default">Full Payment</Badge>;
      case "FIRST_HALF_COMPLETE":
        return <Badge variant="secondary">Two Installments</Badge>;
      case "THREE_INSTALLMENTS":
        return <Badge variant="outline">Three Installments</Badge>;
      case "FOUR_INSTALLMENTS":
        return <Badge variant="outline">Four Installments</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (error) {
    return <div>Error loading payments</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Tracking</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <PaymentStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter payments by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={paymentPlanFilter}
              onValueChange={setPaymentPlanFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment plan" />
              </SelectTrigger>
              <SelectContent>
                {paymentPlanOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={courseFilter}
              onValueChange={setCourseFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select
              value={cohortFilter}
              onValueChange={setCohortFilter}
              disabled={!courseFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder={courseFilter ? "Filter by cohort" : "Select a course first"} />
              </SelectTrigger>
              <SelectContent>
                {cohorts
                  ?.filter((cohort: any) => 
                    courseFilter ? cohort.courseId === courseFilter : true
                  )
                  .map((cohort: any) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter(undefined);
                setPaymentPlanFilter(undefined);
                setCourseFilter(undefined);
                setCohortFilter(undefined);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            {data?.pagination?.total} total payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        className="flex items-center"
                        onClick={() => handleSort("createdAt")}
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Cohort</TableHead>
                    <TableHead>Payment Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Installments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{payment.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.user.email}
                        </div>
                        {payment.user.phone_number && (
                          <div className="text-sm text-muted-foreground">
                            {payment.user.phone_number}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{payment.course.title}</TableCell>
                      <TableCell>
                        {payment.cohort ? (
                          <>
                            <div>{payment.cohort.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(
                                new Date(payment.cohort.startDate),
                                "MMM yyyy"
                              )}
                            </div>
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {getPaymentPlanBadge(payment.paymentPlan)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        ₦{getAmountPaid(payment).toLocaleString()}
                        {payment.paymentPlan === "FIRST_HALF_COMPLETE" && 
                          payment.status === "BALANCE_HALF_PAYMENT" && (
                          <div className="text-sm text-muted-foreground">
                            (of ₦{TOTAL_COURSE_FEE.toLocaleString()})
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getInstallmentStatus(payment)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/users/${payment.user.id}`)
                          }
                        >
                          View User
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataTablePagination
                total={data?.pagination?.total}
                page={Number(page)}
                limit={Number(limit)}
                totalPages={data?.pagination?.totalPages}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<PaymentsLoading />}>
      <PaymentsContent />
    </Suspense>
  );
}