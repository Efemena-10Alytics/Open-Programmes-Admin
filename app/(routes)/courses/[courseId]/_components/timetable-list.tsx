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
import { CourseType, ProjectVideoType, TimeTable } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";
import TimeTableForm from "./timetable-form";

interface ModuleListProps {
  courseId: string;
  initialData: CourseType | null;
}

const TimeTableList = ({ initialData, courseId }: ModuleListProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleConfirmModal = () => {
    setShowConfirmModal(!showConfirmModal);
  };

  const [initialData_, setInitialData_] = useState<TimeTable | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/api/timetables/${initialData_?.id}`);
      toast.success("Course timetable deleted");
      setInitialData_(null);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setInitialData_(null);
      setIsLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <TimeTableForm
          initialData={initialData_!}
          setInitialData={setInitialData_}
          open={showModal}
          setIsOpen={setShowModal}
          courseId={courseId}
        />
      )}

      {showConfirmModal && (
        <AlertDialog
          open={showConfirmModal}
          onOpenChange={() => {
            setShowConfirmModal(false);
            setInitialData_(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will be permanently deleted
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div>
        <div className="flex justify-end mb-5">
          <Button
            onClick={() => {
              setShowModal(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add TimeTable
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          {initialData?.timetable?.map((data, index) => (
            <>
              <div key={data?.id}>
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
                  </div>
                  <div className="ml-auto pr-2 flex items-center gap-x-2">
                    <Pencil
                      onClick={() => {
                        setInitialData_(data);
                        setShowModal(true);
                      }}
                      className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                    />

                    <Trash
                      onClick={() => {
                        setInitialData_(data);
                        toggleConfirmModal();
                      }}
                      className="h-4 w-4 cursor-pointer hover:opacity-75 transition"
                    />
                  </div>
                </div>
              </div>
            </>
          ))}
        </ScrollArea>
      </div>
    </>
  );
};

export default TimeTableList;
