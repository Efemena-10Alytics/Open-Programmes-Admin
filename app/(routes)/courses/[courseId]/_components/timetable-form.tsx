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
import { ProjectVideoType, TimeTable } from "@/types";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeTableFormProps {
  initialData: TimeTable | null;
  setInitialData: any;
  open: boolean;
  courseId: string | undefined;
  setIsOpen: (open: boolean) => void;
}

const eventCategory = [
  { label: "LESSON", value: "LESSON" },
  { label: "QUIZ", value: "QUIZ" },
  { label: "ASSESSMENT", value: "ASSESSMENT" },
  { label: "PROJECT", value: "PROJECT" },
  { label: "LIVE_CLASS", value: "LIVE_CLASS" },
  { label: "BREAK", value: "BREAK" },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Title is required" }),
  category: z.string().min(2, { message: "Title is required" }),
});

const TimeTableForm = ({
  initialData,
  setInitialData,
  courseId,
  setIsOpen,
  open,
}: TimeTableFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const isAddMode = !initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: isAddMode ? "" : initialData?.name,
      category: isAddMode ? "" : initialData?.category,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isAddMode) {
        await axiosInstance.post(`/api/timetable`, {...values, courseId: courseId});
        toast.success("Course Timetable Added");
      } else {
        await axiosInstance.patch(`/api/timetables/${initialData?.id}`, values);
        toast.success("Course Timetable Updated");
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
            {isAddMode ? `Add new timetable` : `Edit timetable details`}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Name </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g 'lorem" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Category </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Select category"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventCategory.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            <div className="flex items-center gap-x-2 capitalize">
                              {item.label.toLowerCase()}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
      </DialogContent>
    </Dialog>
  );
};

export default TimeTableForm;
