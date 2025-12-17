"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CourseWeekType } from "@/types";

export const columns: ColumnDef<CourseWeekType>[] = [
    {
        accessorKey: "iconUrl",
        header: "Icon",
        cell: ({ row }) => (
          <div className="flex items-center gap-x-2">
            <picture>
              <img
                src={row.original.iconUrl}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            </picture>
          </div>
        ),
      },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Week
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },

  // {
  //   accessorKey: "isPublished",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Published
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const isPublished = row.getValue("isPublished") || false;

  //     return (
  //       <Badge className={cn("bg-slate-500", isPublished && "bg-sky-700")}>
  //         {isPublished ? "Published" : "Draft"}
  //       </Badge>
  //     );
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const { courseId, id } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="h-4 w-8 p-0">
              <span className="sr-only"> Open Menu </span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/courses/${courseId}/weeks/${id}`}>
              <DropdownMenuItem>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
