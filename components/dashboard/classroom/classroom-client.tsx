"use client";

import { useSession } from "next-auth/react";
import ManageTab from "./ManageTab";
import { setAuthToken } from "@/utils/axios";
import { useEffect } from "react";

export default function ClassroomClient() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    }
  }, [session]);

  const classroomData = {
    cohortId: "",
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <ManageTab classroomData={classroomData} />
    </div>
  );
}
