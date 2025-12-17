"use client";

import { useState } from "react";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  CohortCourseTimetable,
  CourseType,
  ProjectVideoType,
  TimeTable,
} from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";
import TimeTableForm from "./cohort-timetable-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

interface CohortTimeTableListProps {
  cohortId: string;
  open: boolean;
  cohortTimetable: CohortCourseTimetable[];
  setIsOpen: (open: boolean) => void;
}

const CohortCourseTimeTableList = ({
  cohortTimetable,
  cohortId,
  open,
  setIsOpen,
}: CohortTimeTableListProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [showModal, setShowModal] = useState(false);

  const [initialData_, setInitialData_] =
    useState<CohortCourseTimetable | null>(null);


  const onSubmit = async (date: Date) => {
    try {
      await axiosInstance.patch(
        `/api/cohorts/${cohortId}/update-cohort-course-timetable`,
        { cohortCourseTimeTableId: initialData_?.id, date }
      );
      toast.success("Date updated");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setInitialData_(null);
    }
  };

  return (
    <>
      {/* {showModal && (
        <TimeTableForm
          initialData={initialData_!}
          setInitialData={setInitialData_}
          open={showModal}
          setIsOpen={setShowModal}
          courseId={courseId}
        />
      )} */}
      <Dialog open={open} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {" "}
              Update Cohort Timetable&apos;s Date{" "}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="space-y-3 h-[400px]">
            {cohortTimetable?.map((data, index) => (
              <>
                <div key={data?.id} className="relative">
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-sky-200 border border-sky-200 text-sky-700 rounded-md p-3 mb-4 text-sm"
                    )}
                  >
                    <div className="flex flex-col">
                      {data.name}
                      <p className="text-[12px] italic capitalize">
                        Category: {data.category?.toLowerCase()}
                      </p>
                      <p className="text-[12px] italic capitalize">
                        Date:{" "}
                        {
                          //@ts-ignore
                          format(new Date(data?.date), "MM/dd/yyyy")
                        }
                      </p>
                    </div>
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Pencil
                        onClick={() => {
                          if (initialData_) {
                            setInitialData_(null);
                          } else {
                            setInitialData_(data);
                          }
                          setShowModal(!showModal);
                        }}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />

                      {/* <Trash
                      onClick={() => {
                        setInitialData_(data);
                        toggleConfirmModal();
                      }}
                      className="h-4 w-4 cursor-pointer hover:opacity-75 transition"
                    /> */}
                    </div>
                  </div>
                  {showModal && initialData_ && (
                    <div className="absolute right-0">
                      <DatePicker
                        onChange={(date: Date) => {
                          onSubmit(date);
                        }}
                        value={data.date}
                      />
                    </div>
                  )}
                </div>
              </>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CohortCourseTimeTableList;
