"use client";

import { ColumnDef } from "@tanstack/react-table";
import CellAction from "./cell-action";
import { BlogType } from "@/types";
import { format } from "date-fns";

export const columns: ColumnDef<BlogType>[] = [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <picture>
          <img
            //@ts-ignore
            src={row.original.images[0]?.url}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        </picture>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const formattedDate = format(
        new Date(row.original.createdAt),
        "MM/dd/yyyy - hh:mm a"
      );
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => {
      const formattedDate = format(
        new Date(row.original.updatedAt),
        "MM/dd/yyyy - hh:mm a"
      );
      return <span>{formattedDate}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
