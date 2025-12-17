"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ModuleActionsProps {
  courseId: string | undefined;
  moduleId: string | undefined;
  weekId: string | undefined;
}

const ModuleActions = ({ courseId, moduleId, weekId }: ModuleActionsProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(
        `/api/courses/${courseId}/weeks/${weekId}/modules/${moduleId}`
      );
      toast.success("Module Deleted");
      router.refresh();
      router.push(`/courses/${courseId}/weeks/${weekId}`);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmModal onConfirm={onDelete}>
        <Button size={"sm"} disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default ModuleActions;
