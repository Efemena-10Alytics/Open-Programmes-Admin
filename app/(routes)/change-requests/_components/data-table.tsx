"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, MoreHorizontal, Loader2, User, Mail, Phone, Calendar, BookOpen } from "lucide-react";
import { axiosInstance } from "@/utils/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ChangeRequest {
  id: string;
  type: "COURSE_CHANGE" | "DEFERMENT";
  userId: string;
  user: {
    name: string;
    email: string;
    phone_number: string;
  };
  currentCourseId: string;
  currentCourse: {
    title: string;
    imageUrl?: string;
  };
  desiredCourseId: string;
  desiredCourse: {
    title: string;
    imageUrl?: string;
  };
  currentCohortId: string;
  currentCohort: {
    name: string;
    startDate: string;
  };
  desiredCohortId: string;
  desiredCohort: {
    name: string;
    startDate: string;
  };
  reason: string;
  status: string;
  adminReason?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: {
    name: string;
  };
  paymentStatus?: {
    cohort?: {
      id: string;
      name: string;
    } | null;
  };
  paymentLink?: string;
  paymentDueDate?: string;
}

interface ChangeRequestsDataTableProps {
  initialData: ChangeRequest[];
}

export function ChangeRequestsDataTable({
  initialData,
}: ChangeRequestsDataTableProps) {
  const [data, setData] = useState<ChangeRequest[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestDetailsDialogOpen, setRequestDetailsDialogOpen] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<ChangeRequest | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const response = await axiosInstance.get(`/api/admin/change-requests`);
      if (response.status === 200) {
        setData(response.data?.data || []);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string, adminReason?: string) => {
    setIsProcessing(requestId);
    try {
      const response = await axiosInstance.patch(
        `/api/admin/change-requests/${requestId}`,
        { status, adminReason }
      );

      if (response.data.status === "success") {
        await refreshData();
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update request. Please try again.");
    } finally {
      setIsProcessing(null);
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectReason("");
    }
  };

  const openRejectDialog = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (selectedRequest && rejectReason.trim()) {
      handleStatusUpdate(selectedRequest.id, "REJECTED", rejectReason.trim());
    }
  };

  const showUserDetails = (user: any) => {
    setSelectedUser(user);
    setUserDetailsDialogOpen(true);
  };

  const showRequestDetails = (request: ChangeRequest) => {
    setSelectedRequestDetails(request);
    setRequestDetailsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING": return "secondary";
      case "APPROVED": return "default";
      case "PAYMENT_PENDING": return "outline";
      case "COMPLETED": return "success";
      case "REJECTED": return "destructive";
      default: return "secondary";
    }
  };

  const columns: ColumnDef<ChangeRequest>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "COURSE_CHANGE" ? "default" : "outline"}>
          {row.original.type === "COURSE_CHANGE" ? "Course Change" : "Deferment"}
        </Badge>
      ),
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[150px]">
          <div className="font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            {row.original.user.name}
          </div>
          <div 
            className="text-sm text-gray-500 truncate flex items-center gap-2 cursor-pointer hover:text-blue-600"
            onClick={() => showUserDetails(row.original.user)}
          >
            <Mail className="h-3 w-3" />
            {row.original.user.email}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Phone className="h-3 w-3" />
            {row.original.user.phone_number || "N/A"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "currentDetails",
      header: "Current",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          {row.original.type === "COURSE_CHANGE" ? (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>{row.original.currentCourse?.title}</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="font-medium">{row.original.currentCohort?.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {row.original.currentCohort?.startDate ? formatDate(row.original.currentCohort.startDate) : "N/A"}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "desiredDetails",
      header: "Desired",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          {row.original.type === "COURSE_CHANGE" ? (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-500" />
              <span>{row.original.desiredCourse?.title}</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="font-medium">{row.original.desiredCohort?.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {row.original.desiredCohort?.startDate ? formatDate(row.original.desiredCohort.startDate) : "N/A"}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div 
            className="line-clamp-2 cursor-pointer hover:text-blue-600" 
            title={row.original.reason}
            onClick={() => showRequestDetails(row.original)}
          >
            {row.original.reason}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Request Date",
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const request = row.original;
        
        if (request.status !== "PENDING") {
          return (
            <div className="text-sm text-gray-500 space-y-1">
              {request.processedBy && (
                <div>By: {request.processedBy.name}</div>
              )}
              {request.processedAt && (
                <div>On: {formatDate(request.processedAt)}</div>
              )}
              {request.adminReason && request.status === "REJECTED" && (
                <div className="max-w-xs truncate" title={request.adminReason}>
                  Reason: {request.adminReason}
                </div>
              )}
              {request.status === "PAYMENT_PENDING" && (
                <div className="text-xs text-orange-600">
                  Payment pending
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(request.id, "APPROVED")}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing === request.id || isRefreshing}
            >
              {isProcessing === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openRejectDialog(request)}
              disabled={isProcessing === request.id || isRefreshing}
            >
              {isProcessing === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter by user name..."
              value={(table.getColumn("user")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("user")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            {isRefreshing && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <Select
            value={(table.getColumn("type")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("type")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="COURSE_CHANGE">Course Change</SelectItem>
              <SelectItem value="DEFERMENT">Deferment</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PAYMENT_PENDING">Payment Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No change requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} request(s) total.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isRefreshing}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isRefreshing}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Change Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="col-span-3"
                placeholder="Enter the reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason.trim() || isProcessing !== null}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsDialogOpen} onOpenChange={setUserDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedUser && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Name</Label>
                  <div className="col-span-3">{selectedUser.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Email</Label>
                  <div className="col-span-3">{selectedUser.email}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Phone</Label>
                  <div className="col-span-3">{selectedUser.phone_number || "N/A"}</div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog open={requestDetailsDialogOpen} onOpenChange={setRequestDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Request Details - {selectedRequestDetails?.type === "COURSE_CHANGE" ? "Course Change" : "Deferment"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedRequestDetails && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">User</Label>
                  <div className="col-span-3">{selectedRequestDetails.user.name}</div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Current</Label>
                  <div className="col-span-3">
                    {selectedRequestDetails.type === "COURSE_CHANGE" 
                      ? selectedRequestDetails.currentCourse?.title
                      : `${selectedRequestDetails.currentCohort?.name} (${formatDate(selectedRequestDetails.currentCohort?.startDate || "")})`
                    }
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Desired</Label>
                  <div className="col-span-3">
                    {selectedRequestDetails.type === "COURSE_CHANGE" 
                      ? selectedRequestDetails.desiredCourse?.title
                      : `${selectedRequestDetails.desiredCohort?.name} (${formatDate(selectedRequestDetails.desiredCohort?.startDate || "")})`
                    }
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Reason</Label>
                  <div className="col-span-3 whitespace-pre-wrap">{selectedRequestDetails.reason}</div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Status</Label>
                  <div className="col-span-3">
                    <Badge variant={getStatusBadgeVariant(selectedRequestDetails.status)}>
                      {selectedRequestDetails.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Request Date</Label>
                  <div className="col-span-3">{formatDate(selectedRequestDetails.createdAt)}</div>
                </div>
                
                {selectedRequestDetails.processedBy && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Processed By</Label>
                    <div className="col-span-3">{selectedRequestDetails.processedBy.name}</div>
                  </div>
                )}
                
                {selectedRequestDetails.processedAt && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Processed At</Label>
                    <div className="col-span-3">{formatDate(selectedRequestDetails.processedAt)}</div>
                  </div>
                )}
                
                {selectedRequestDetails.adminReason && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Admin Reason</Label>
                    <div className="col-span-3 whitespace-pre-wrap">{selectedRequestDetails.adminReason}</div>
                  </div>
                )}
                
                {selectedRequestDetails.paymentLink && selectedRequestDetails.status === "PAYMENT_PENDING" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Payment Link</Label>
                    <div className="col-span-3">
                      <a 
                        href={selectedRequestDetails.paymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedRequestDetails.paymentLink}
                      </a>
                    </div>
                  </div>
                )}
                
                {selectedRequestDetails.paymentDueDate && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Payment Due Date</Label>
                    <div className="col-span-3">{formatDate(selectedRequestDetails.paymentDueDate)}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}