"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
});

export default function CreatePage() {
  const router = useRouter();

  const { data: session, status } = useSession();

  // Set auth token when session is available
  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    }
  }, [session?.accessToken]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Ensure we have a valid session and token before making the request
      if (!session?.accessToken) {
        toast.error("You must be logged in to create a course");
        return;
      }

      // Set the token again just to be safe
      setAuthToken(session.accessToken);

      const response = await axiosInstance.post("/api/courses", values);
      toast.success("Course created successfully!");
      router.push(`/cohort/${response.data?.data?.id}`);
    } catch (error: any) {
      console.error("Course creation error:", error);

      if (error.response?.status === 403) {
        toast.error("Authentication failed. Please log out and log in again.");
      } else if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:items-start md:justify-center h-full py-6 lg:p-6">
      <>
        <div>
          <h1 className="text-2xl">Name your course</h1>
          <p className="text-sm text-slate-600">
            What would you like to name your course? Don&apos;t worry, you can
            change this later.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-8 w-full"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Title </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g Advanced web development"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What will you teach in this course ?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Link href={"/"}>
                <Button type="button" variant={"ghost"}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </>
    </div>
  );
}
