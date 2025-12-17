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
import { toast } from "sonner";
import { CourseType } from "@/types";
import SimpleEditor from "@/components/simple-editor";
import InstructorImageForm from "./instructor-image-form";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  course_instructor_name: z.string().min(2, { message: "Name is required" }),
  course_instructor_title: z.string().min(2, { message: "Title is required" }),
  course_instructor_description: z
    .string()
    .min(2, { message: "Description is required" }),
  course_instructor_ratings: z.string().optional(),
  course_instructor_courses: z.string().optional(),
  course_instructor_lessons: z.string().optional(),
  course_instructor_hrs: z.string().optional(),
  course_instructor_students_trained: z.string().optional(),
});

interface InstructorFormProps {
  initialData: CourseType | null;
  courseId: string | undefined;
}

const InstructorForm = ({ initialData, courseId }: InstructorFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_instructor_name: initialData?.course_instructor_name || "",
      course_instructor_title: initialData?.course_instructor_title || "",
      course_instructor_description:
        initialData?.course_instructor_description || "",
      course_instructor_ratings: initialData?.course_instructor_ratings || "",
      course_instructor_courses: initialData?.course_instructor_courses || "",
      course_instructor_lessons: initialData?.course_instructor_lessons || "",
      course_instructor_hrs: initialData?.course_instructor_hrs || "",
      course_instructor_students_trained:
        initialData?.course_instructor_students_trained || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosInstance.patch(`/api/courses/${courseId}`, values);
      toast.success("Course Instructor Updated");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <InstructorImageForm initialData={initialData} courseId={courseId} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="course_instructor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Instructor Name </FormLabel>
                <FormControl>
                  <Input placeholder="e.g Joseph Wattz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_instructor_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Instructor Title </FormLabel>
                <FormControl>
                  <Input placeholder="e.g Data Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_instructor_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor Description</FormLabel>
                <FormControl>
                  <SimpleEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_instructor_ratings"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Instructor Rating </FormLabel>
                <FormControl>
                  <Input
                    placeholder="1 - 5; Not greater than 5"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_instructor_courses"
            render={({ field }) => (
              <FormItem>
                <FormLabel> No. of Courses </FormLabel>
                <FormControl>
                  <Input placeholder="e.g 5 Courses" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_instructor_lessons"
            render={({ field }) => (
              <FormItem>
                <FormLabel> No. of Lessons </FormLabel>
                <FormControl>
                  <Input placeholder="e.g 1000+  Lessons" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_instructor_hrs"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Hour&apos;s spent </FormLabel>
                <FormControl>
                  <Input placeholder="e.g 800hrs 30mins" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_instructor_students_trained"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Student&apos;s trained </FormLabel>
                <FormControl>
                  <Input placeholder="e.g 18000+ Students Trained" {...field} />
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

export default InstructorForm;
