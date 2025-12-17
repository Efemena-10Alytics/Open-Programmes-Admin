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
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ModuleType } from "@/types";
import { toast } from "sonner";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  description: z.string().min(2, { message: "Description is required" }),
});

interface DescriptionFormProps {
  initialData: ModuleType | null;
  courseId: string | undefined;
  moduleId: string | undefined;
  weekId: string | undefined;
}

const DescriptionForm = ({
  initialData,
  courseId,
  moduleId,
  weekId,
}: DescriptionFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description as string,
    },
  });
  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosInstance.patch(
        `/api/courses/${courseId}/weeks/${weekId}/modules/${moduleId}`,
        values
      );
      toast.success("Module Updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <span>
          Module Description
          <i className="ml-2">(optional)</i>
        </span>
        <Button type="button" onClick={toggleEdit} variant={"ghost"}>
          {isEditing ? (
            <> Cancel </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Description
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className="text-sm mt-2">{initialData?.description}</p>}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Description </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g Advanced web development"
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
      )}
    </div>
  );
};

export default DescriptionForm;
