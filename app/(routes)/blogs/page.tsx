import BlogClient from "./components/blog-client";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { BlogType } from "@/types";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function BlogPage() {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let blogs: BlogType[] = [];

  try {
    await axiosInstance.get("/api/blogs").then((response) => {
      if (response && response.status === 200) {
        blogs = response.data?.data;
      }
    });
  } catch (error) {
    console.log("Something went wrong while fetching blogs");
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BlogClient blogs={blogs} />
      </div>
    </div>
  );
}
