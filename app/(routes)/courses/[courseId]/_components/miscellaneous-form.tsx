"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { CourseType } from "@/types";
import SimpleEditor from "@/components/simple-editor";
import InstructorImageForm from "./instructor-image-form";
import { useSession } from "next-auth/react";
import { axiosInstance, setAuthToken } from "@/utils/axios";

const formSchema = z.object({
  course_duration: z.string().min(2, { message: "Duration is required" }),
  brochureUrl: z.string().min(2, { message: "Brochure url is required" }),
  course_preview_video: z
    .string()
    .min(2, { message: "Course preview video url is required" }),
});

interface InstructorFormProps {
  initialData: CourseType | null;
  courseId: string | undefined;
}

const MiscellenousForm = ({ initialData, courseId }: InstructorFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_duration: initialData?.course_duration || "",
      course_preview_video: initialData?.course_preview_video || "",
      brochureUrl:
        initialData?.brochureUrl || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosInstance.patch(`/api/courses/${courseId}`, values);
      toast.success("Course Updated");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="course_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>   Course Duration </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g 1 hour"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_preview_video"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Course Preview Link </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g https://video_link.com/..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brochureUrl"
            render={({ field }) => (
              <FormItem>
              <FormLabel> Brochure Link </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g https://brochure_link.com/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
          />

          <div className="flex items-center gap-x-2">
            <Button type="submit" disabled={!isValid || isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MiscellenousForm;
