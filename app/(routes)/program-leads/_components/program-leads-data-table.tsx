// app/(dashboard)/program-leads/_components/program-leads-data-table.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProgramLead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  programType: string;
  hearAbout: string;
  otherSource?: string;
  createdAt: string;
}

interface ProgramLeadsDataTableProps {
  initialData: ProgramLead[];
  programTypes: string[];
}

export const ProgramLeadsDataTable: React.FC<ProgramLeadsDataTableProps> = ({
  initialData,
  programTypes,
}) => {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  const filteredData = filter === "all" 
    ? initialData 
    : initialData.filter(lead => lead.programType === filter);

  const columns: ColumnDef<ProgramLead>[] = [
    {
      accessorKey: "firstName",
      header: "First Name",
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
    },
    {
      accessorKey: "gender",
      header: "Gender",
    },
    {
      accessorKey: "programType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Program Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const programType = row.getValue("programType") as string;
        return (
          <Badge variant="outline" className="capitalize">
            {programType}
          </Badge>
        );
      },
    },
    {
      accessorKey: "hearAbout",
      header: "Source",
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(lead.email)}
              >
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(lead.phoneNumber)}
              >
                Copy Phone
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`mailto:${lead.email}`)}
              >
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`https://wa.me/${lead.phoneNumber}`, '_blank')}
              >
                WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center py-4 space-x-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Programs</option>
          {programTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <DataTable columns={columns} data={filteredData} searchKey={""} />
    </div>
  );
};