"use client";

import { CourseType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil } from "lucide-react";
import { useState } from "react";

interface CellActionProps {
  data: CourseType;
}

const CellAction = ({ data }: CellActionProps) => {
  const [editModal, setEditModal] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-4 w-8 p-0">
            <span className="sr-only"> Open Menu </span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <span className="cursor-pointer" onClick={() => setEditModal(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;
