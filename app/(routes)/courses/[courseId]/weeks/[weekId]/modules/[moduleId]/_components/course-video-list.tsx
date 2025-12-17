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
import { ProjectVideoType } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CourseVideoForm from "./course-video-form";
import { toast } from "sonner";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";

interface ModuleListProps {
  courseVideos: ProjectVideoType[];
  courseId: string;
  weekId: string | undefined;
  moduleId: string | undefined;
}

const CourseVideoList = ({
  courseVideos,
  weekId,
  courseId,
  moduleId,
}: ModuleListProps) => {
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

  const [initialData, setInitialData] = useState<ProjectVideoType | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(
        `/api/courses/${courseId}/weeks/${weekId}/modules/${moduleId}/videos/${initialData?.id}`
      );
      toast.success("Course video deleted");
      setInitialData(null);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setInitialData(null);
      setIsLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <CourseVideoForm
          initialData={initialData!}
          setInitialData={setInitialData}
          open={showModal}
          setIsOpen={setShowModal}
          courseId={courseId}
          weekId={weekId}
          moduleId={moduleId}
        />
      )}

      {showConfirmModal && (
        <AlertDialog
          open={showConfirmModal}
          onOpenChange={() => {
            setShowConfirmModal(false);
            setInitialData(null);
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
            Add Course Video
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          {courseVideos?.map((video, index) => (
            <>
              <div key={video?.id}>
                <div
                  className={cn(
                    "flex items-center gap-x-2 bg-sky-200 border border-sky-200 text-sky-700 rounded-md mb-4 text-sm"
                  )}
                >
                  <div
                    className={cn(
                      "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition"
                    )}
                  >
                    <picture>
                      <img
                        src={video?.thumbnailUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-contain"
                      />
                    </picture>
                  </div>
                  {video.title}
                  <div className="ml-auto pr-2 flex items-center gap-x-2">
                    <Pencil
                      onClick={() => {
                        setInitialData(video);
                        setShowModal(true);
                      }}
                      className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                    />

                    <Trash
                      onClick={() => {
                        setInitialData(video);
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

export default CourseVideoList;
