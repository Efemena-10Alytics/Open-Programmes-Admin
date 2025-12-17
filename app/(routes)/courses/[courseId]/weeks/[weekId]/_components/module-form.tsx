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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { toast } from "sonner";
import { ModuleType } from "@/types";
import { useSession } from "next-auth/react";

interface ModuleFormProps {
  weekId: string | undefined;
  courseId: string | undefined;
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
});

const ModuleForm = ({ open, weekId, courseId, setIsOpen }: ModuleFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosInstance.post(
        `/api/courses/${courseId}/weeks/${weekId}/modules`,
        values
      );
      toast.success("Module Created");
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a new Module</DialogTitle>
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
                      <Input placeholder="e.g Module 1" {...field} />
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

export default ModuleForm;
