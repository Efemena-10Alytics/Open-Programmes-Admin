"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { CohortCourseWeek } from "@/types";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CohortFormProps {
  cohortId: string;
  courseWeeks?: CohortCourseWeek[];
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

const CohortCourseWeekForm = ({
  cohortId,
  courseWeeks,
  open,
  setIsOpen,
}: CohortFormProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [courseWeekId, setCourseWeekId] = useState("");

  const handleSwitchChange = async (checked: boolean, weekId: string) => {
    setCourseWeekId(weekId);
    try {
      await axiosInstance.patch(
        `/api/cohorts/${cohortId}/update-cohort-course-week`,
        { isPublished: checked, courseWeekId: weekId }
      );
      toast.success(
        checked
          ? "This week along with its related contents will become visible to students"
          : "This week along with its related contents will be hidden from students"
      );
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl"> Update Course Week</DialogTitle>
        </DialogHeader>

        <ScrollArea className="space-y-3 h-[400px]">
          {courseWeeks?.map((week) => (
            <div key={week?.id}>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-base font-medium">{week?.title}</span>
                <Switch
                  className="focus-within:outline-none focus:outline-none outline-none"
                  checked={week?.isPublished}
                  onCheckedChange={(checked) =>
                    handleSwitchChange(checked, week.id)
                  }
                />
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CohortCourseWeekForm;
