"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { toast } from "sonner";
import { FileUpload } from "@/components/uploadthing/file-uploader";
import { ProjectVideoType } from "@/types";
import { useSession } from "next-auth/react";

interface WeekFormProps {
  initialData: ProjectVideoType | null;
  setInitialData: any;
  open: boolean;
  courseId: string | undefined;
  moduleId: string | undefined;
  weekId: string | undefined;
  setIsOpen: (open: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  videoUrl: z.string().min(2, { message: "Video url is required" }).optional(),
  thumbnailUrl: z
    .string()
    .optional(),
  duration: z.string().min(2, { message: "Duration is required" }).optional(),
});

const CourseVideoForm = ({
  initialData,
  setInitialData,
  courseId,
  moduleId,
  weekId,
  setIsOpen,
  open,
}: WeekFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const isAddMode = !initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: isAddMode ? "" : initialData?.title,
      videoUrl: isAddMode ? "" : initialData?.videoUrl,
      thumbnailUrl: isAddMode ? "" : initialData?.thumbnailUrl,
      duration: isAddMode ? "" : initialData?.duration,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isAddMode) {
        await axiosInstance.post(
          `/api/courses/${courseId}/weeks/${weekId}/modules/${moduleId}/videos`,
          values
        );
        toast.success("Course Video Added");
      } else {
        await axiosInstance.patch(
          `/api/courses/${courseId}/weeks/${weekId}/modules/${moduleId}/videos/${initialData?.id}`,
          values
        );
        toast.success("Course Video Updated");
        setInitialData(null);
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
            {isAddMode ? `Add new video` : `Edit video details`}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Thumbnail </FormLabel>
                    <FormControl>
                      <FileUpload
                        endpoint="imageUploader"
                        value={field.value!}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Title </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g 'lorem" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Video Url </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g 'https://video_url.com/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Duration </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g 30 Mins" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-x-2">
                <Button type="submit" disabled={!form.getFieldState("title").isDirty || isSubmitting}>
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseVideoForm;
