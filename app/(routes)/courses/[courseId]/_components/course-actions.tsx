"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { Telescope, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CourseActionsProps {
  courseId: string | undefined;
}

const CourseActions = ({
  courseId,
}: CourseActionsProps) => {
  const router = useRouter();

  
  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/api/courses/${courseId}/`);
      toast.success("Course Deleted");
      router.refresh();
      router.push(`/courses`);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
       <Link href={`/courses/${courseId}/weeks`}>
          <Button>
            <Telescope className="h-4 w-4 mr-2" />
            View Weeks
          </Button>
        </Link>
      <ConfirmModal onConfirm={onDelete}>
        <Button size={"sm"} disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default CourseActions;
