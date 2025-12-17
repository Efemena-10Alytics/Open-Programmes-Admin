import { BlogType } from "@/types";
import BlogForm from "./components/blog-form";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

interface BlogPageProps {
  params: {
    blogId: string;
  };
}
export default async function BlogPage({ params }: BlogPageProps) {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  const { blogId } = params;

  const blog: BlogType = await axiosInstance
    .get(`/api/blogs/${blogId}`)
    .then((response) => {
      if (response && response.status === 200) {
        return response.data?.data;
      } else {
        return {}
      }
    });

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BlogForm initialData={blog} />
      </div>
    </div>
  );
}
