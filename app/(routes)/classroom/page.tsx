import { getServerSession } from "next-auth";
import { options } from "../../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { setAuthToken } from "@/utils/axios";
import ClassroomClient from "@/components/dashboard/classroom/classroom-client";

export default async function ClassroomPage() {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    return redirect("/auth/signin");
  }

  setAuthToken(session.accessToken);

  return <ClassroomClient />;
}