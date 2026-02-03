"use client";

import { useState } from "react";
import {
  CircleCheck,
  CircleDot,
  Pencil,
  PlusCircle,
  Trash,
} from "lucide-react";
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
import { QuizType } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";
import ModuleQuizForm from "./module-quiz-form";

interface ModuleListProps {
  quizzes: QuizType[];
  courseId: string;
  weekId: string;
}

const CourseQuizList = ({ quizzes, weekId, courseId }: ModuleListProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [initialData, setInitialData] = useState<QuizType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleConfirmModal = () => {
    setShowConfirmModal(!showConfirmModal);
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/api/quiz/${initialData?.id}`);
      toast.success("Quiz deleted");
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
        <ModuleQuizForm
          initialData={initialData}
          setInitialData={setInitialData}
          open={showModal}
          setIsOpen={setShowModal}
          courseId={courseId}
          weekId={weekId}
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
              setInitialData(null);
              setShowModal(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Quiz
          </Button>
        </div>
        <ScrollArea className="h-[400px] bg-gray-50 border border-primary text-foreground rounded-md">
          {quizzes?.map((quiz, index) => (
            <div key={quiz?.id} className="mb-3">
              <div className="flex flex-col text-sm p-2">
                <div className="flex items-center gap-x-2 text-sm font-medium">
                  {index + 1}. {quiz.question}
                  <div className="ml-auto pr-2 flex items-center gap-x-2">
                    <Pencil
                      onClick={() => {
                        setInitialData(quiz);
                        setShowModal(true);
                      }}
                      className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                    />
                    <Trash
                      onClick={() => {
                        setInitialData(quiz);
                        toggleConfirmModal();
                      }}
                      className="h-4 w-4 cursor-pointer hover:opacity-75 transition"
                    />
                  </div>
                </div>
                <div className="space-y-1 px-5 mt-1">
                  {quiz.answers?.map((answer) => (
                    <span
                      key={answer.id}
                      className="w-full flex items-center bg-white border border-gray-200 shadow-sm rounded-lg p-1 text-wrap text-[12px]"
                    >
                      <p className="w-[99%] flex items-center">
                        <CircleDot className="h-3 w-3 text-primary mr-1" />
                        {answer.name}
                      </p>
                      <span className="w-[1%] mr-3">
                        {answer.isCorrect && (
                          <CircleCheck className="h-4 w-4 text-green-500" />
                        )}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </>
  );
};

export default CourseQuizList;
