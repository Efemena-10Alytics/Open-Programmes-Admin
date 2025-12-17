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
import { CourseWeekType } from "@/types";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";
import WeekImageForm from "./week-image-form";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
});

interface InstructorFormProps {
  initialData: CourseWeekType | null;
  weekId: string | undefined;
  courseId: string | undefined;
}

const WeekForm = ({ initialData, courseId, weekId }: InstructorFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosInstance.patch(`/api/courses/${courseId}/weeks/${weekId}`, values);
      toast.success("Week Updated");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <WeekImageForm initialData={initialData} courseId={courseId} weekId={weekId} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Week Title </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g Joseph Wattz"
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

export default WeekForm;
