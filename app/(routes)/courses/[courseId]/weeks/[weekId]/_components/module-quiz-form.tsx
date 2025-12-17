"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { toast } from "sonner";
import { QuizType } from "@/types";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WeekFormProps {
  initialData: QuizType | null;
  setInitialData: any;
  open: boolean;
  courseId: string;
  weekId: string;
  setIsOpen: (open: boolean) => void;
}

const formSchema = z.object({
  question: z.string().min(2, { message: "Question is required" }),
  answers: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2, { message: "At least 2 answers are required" }),
});

const ModuleQuizForm = ({
  initialData,
  setInitialData,
  courseId,
  weekId,
  setIsOpen,
  open,
}: WeekFormProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const isEditMode = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      initialData && initialData.answers
        ? {
            question: initialData.question,
            answers: initialData.answers.map((answer) => ({
              id: answer.id,
              name: answer.name,
              isCorrect: answer.isCorrect,
            })),
          }
        : {
            question: "",
            answers: [
              { name: "", isCorrect: false },
              { name: "", isCorrect: false },
              { name: "", isCorrect: false },
              { name: "", isCorrect: false },
            ],
          },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditMode) {
        // Update existing quiz
        await axiosInstance.patch(`/api/quiz/${initialData?.id}`, values);
        toast.success("Quiz updated");
      } else {
        // Create new quiz - first get a module for this week
        const modules = await axiosInstance.get(
          `/api/courses/${courseId}/weeks/${weekId}/modules`
        );
        if (!modules.data?.data?.length) {
          toast.error("No modules found for this week");
          return;
        }

        // Use the first module for the quiz
        const moduleId = modules.data.data[0].id;

        await axiosInstance.post(`/api/quiz`, {
          ...values,
          moduleId,
        });
        toast.success("Quiz created");
      }
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setIsOpen(false);
        setInitialData(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditMode ? "Edit Quiz" : "Add New Quiz"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="w-full h-[300px]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4 px-4"
            >
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g 'What is the capital of France?'"
                        {...field}
                        className="h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`answers.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option {index + 1}</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-7">
                          <Textarea
                            placeholder={`Option ${index + 1}`}
                            className="h-10"
                            {...field}
                          />
                          <div>
                            <span className="text-[12px]">Correct?</span>
                            <FormField
                              control={form.control}
                              name={`answers.${index}.isCorrect`}
                              render={({ field }) => (
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <div className="flex items-center gap-x-2">
                <Button type="submit" disabled={!isValid || isSubmitting}>
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleQuizForm;
