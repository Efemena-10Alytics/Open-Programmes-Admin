"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { BlogType } from "@/types";

interface BlogClientProps {
  blogs: BlogType[];
}

const BlogClient: React.FC<BlogClientProps> = ({ blogs }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Blogs (${blogs?.length})`}
          description="Manage blogs for your application"
        />
        <Button
          onClick={() => router.push(`/blogs/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="title" data={blogs} columns={columns} />
    </>
  );
};

export default BlogClient;
