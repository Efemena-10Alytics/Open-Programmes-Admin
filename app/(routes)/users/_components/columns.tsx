"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { User } from "@/types";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { CellActions } from "./cell-actions";
import { roles } from "./toolbar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Create a separate component for the clickable name
const ClickableName = ({ name, id }: { name: string; id: string }) => {
  const router = useRouter();
  
  return (
    <div
      className="flex items-center gap-x-3 cursor-pointer hover:underline"
      onClick={() => router.push(`/users/${id}`)}
    >
      <span className="font-medium text-gray-900 hover:text-blue-600">
        {name}
      </span>
    </div>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "",
    header: "S/N",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-600">{row.index + 1}</span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent"
      >
        <span className="font-medium">Name</span>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <ClickableName name={row.original.name} id={row.original.id} />
    ),
  },
  {
    accessorKey: "email",
    header: () => <span className="font-medium">Email</span>,
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: () => <span className="font-medium">Role</span>,
    cell: ({ row }) => {
      const role = roles.find((role) => role.value === row.getValue("role"));
      if (!role) return null;

      return (
        <div className="flex items-center">
          {role.icon && (
            <role.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{role.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "progress",
    header: () => <span className="font-medium">Progress</span>,
    cell: ({ row }) => {
      const videosCompleted = row.original.videosCompleted || 0;
      const totalVideos = row.original.totalVideos || 20;
      const expectedVideoProgress = row.original.expectedVideoProgress || 75;

      const videoPercentage = Math.round((videosCompleted / totalVideos) * 100);

      return (
        <div className="w-40">
          <div className="flex justify-between text-xs mb-1">
            <span>{videoPercentage}%</span>
            {videoPercentage < expectedVideoProgress && (
              <span className="text-blue-600">{expectedVideoProgress}%</span>
            )}
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-full bg-blue-500 rounded-full"
              style={{ width: `${videoPercentage}%` }}
            ></div>
            {videoPercentage < expectedVideoProgress && (
              <div
                className="absolute w-0.5 h-3 bg-blue-500 top-0 transform -translate-y-0.5"
                style={{ left: `${expectedVideoProgress}%` }}
              ></div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {videosCompleted}/{totalVideos} videos
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: () => <span className="font-medium">Verified</span>,
    cell: ({ row }) => {
      if (!row.original.emailVerified) return null;
      return (
        <span className="text-sm text-gray-600">
          {format(new Date(row.original.emailVerified), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    accessorKey: "course_purchased",
    header: () => <span className="font-medium">Courses</span>,
    cell: ({ row }) => {
      const purchases = row.original.course_purchased || [];
      if (purchases.length === 0) {
        return <span className="text-sm text-gray-400">None</span>;
      }
      return (
        <div className="flex flex-col gap-1">
          {purchases.map((purchase) => (
            <span key={purchase.course?.id} className="text-sm text-gray-700">
              {purchase.course?.title}
            </span>
          ))}
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue?.length) return true;
      const purchases = row.original.course_purchased || [];
      return purchases.some(
        (purchase) =>
          purchase.course && filterValue.includes(purchase.course.id)
      );
    },
  },
  {
    accessorKey: "cohorts",
    header: () => <span className="font-medium">Cohorts</span>,
    cell: ({ row }) => {
      const userCohorts = row.original.cohorts || [];
      if (userCohorts.length === 0) {
        return <span className="text-sm text-gray-400">None</span>;
      }
      return (
        <div className="flex flex-col gap-1">
          {userCohorts.map((userCohort) => (
            <span key={userCohort.cohort?.id} className="text-sm text-gray-700">
              {userCohort.cohort?.name}
            </span>
          ))}
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      if (!filterValue?.length) return true;
      const userCohorts = row.original.cohorts || [];
      return userCohorts.some(
        (userCohort) =>
          userCohort.cohort && filterValue.includes(userCohort.cohort.id)
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];