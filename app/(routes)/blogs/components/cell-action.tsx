"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AlertModal from "@/components/modals/alert-modal";
import { BlogType } from "@/types";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";

interface CellActionProps {
  data: BlogType;
}

const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(data.id);
    toast.success("Blog ID copied to the clipboard");
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      await axiosInstance.delete(
        `/api/blogs/${data.id}`
      );

      router.refresh();
      toast.success("Blog Deleted.");
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <AlertModal 
    isOpen={open}
    onClose={() => setOpen(false)}
    onConfirm={onDelete}
    loading={loading}
    />
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant={"ghost"} className="h-8 w-8 p-0">
          <span className="sr-only"> Open Menu </span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Action</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Id
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`blogs/${data?.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Update
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpen(true)}>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
};

export default CellAction;
