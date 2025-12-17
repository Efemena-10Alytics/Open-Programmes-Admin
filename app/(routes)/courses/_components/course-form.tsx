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
import { axiosInstance } from "@/utils/axios";
import { toast } from "sonner";

interface WeekFormProps {
    courseId: string;
    open: boolean;
    setIsOpen: (open: boolean) => void;
}

const formSchema = z.object({
    title: z.string().min(2, { message: "Title is required" }),
  });
  

export const CourseForm = ({courseId, setIsOpen, open }: WeekFormProps) => {

    const router = useRouter();
  
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "",
      },
    });

    const { isSubmitting, isValid } = form.formState;
  
    async function onSubmit(values: z.infer<typeof formSchema>) {
      try {
        const response = await axiosInstance.put(`/api/courses/${courseId}`, values);
        toast.success("Course Updated");
        router.push(`/courses/${courseId}/weeks/${response?.data?.data?.id}`);
      } catch (error) {
        toast.error("Something went wrong");
      }
    }

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl"> Create a new week </DialogTitle>
        </DialogHeader>
          <div className="w-full">
          <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Title </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g Week 1"
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
      </DialogContent>
    </Dialog>
  );
};
