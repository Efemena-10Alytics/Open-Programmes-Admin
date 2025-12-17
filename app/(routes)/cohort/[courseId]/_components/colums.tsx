"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { CohortType } from "@/types";
import { format } from "date-fns";
import CellAction from "./cell-action";

export const columns: ColumnDef<CohortType>[] = [
  {
    header: "S/N",
    cell: ({ row }) => {
      return <p className="pl-3"> {row.index + 1}. </p>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cohort Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <p className="pl-3"> {row.original.name} </p>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const startDate = row.original.startDate;
      const formattedDate =
        startDate !== null && startDate !== undefined
          ? format(new Date(startDate), "MM/dd/yyyy - hh:mm a")
          : "";
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const endDate = row.original.endDate;
      const formattedDate =
        endDate !== null && endDate !== undefined
          ? format(new Date(endDate), "MM/dd/yyyy - hh:mm a")
          : "";
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      const formattedDate =
        createdAt !== null && createdAt !== undefined
          ? format(new Date(createdAt), "MM/dd/yyyy - hh:mm a")
          : "";
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: "",
    header: "No. of Students",
    cell: ({ row }) => {
      return <span className="pl-11">{row.original?.users?.length}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <CellAction data={row.original} />;
    },
  },
];
