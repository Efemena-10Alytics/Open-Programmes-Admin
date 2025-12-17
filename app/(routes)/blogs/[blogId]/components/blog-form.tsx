"use client";
import AlertModal from "@/components/modals/alert-modal";
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
import Heading from "@/components/ui/heading";
// import ImageUpload from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MultipleFileUpload } from "@/components/uploadthing/multiple-file-uploader";
import SimpleEditor from "@/components/simple-editor";
import { minsReadData } from "@/data";
import { BlogType } from "@/types";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { string, z } from "zod";

const formSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  mins_read: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
});

interface BlogFormProps {
  initialData: BlogType | null;
}

type BlogFormvalues = z.infer<typeof formSchema>;

const BlogForm: React.FC<BlogFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toastMessage = initialData ? "Blog updated." : "Blog created.";
  const action = initialData ? "Save changes." : "Create";

  const form = useForm<BlogFormvalues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
        }
      : {
          title: "",
          content: "",
          mins_read: "",
          images: [],
        },
  });

  const onSubmit = async (data: BlogFormvalues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axiosInstance.put(`/api/blogs/${params?.blogId}`, data);
      } else {
        await axiosInstance.post(`/api/blogs`, data);
      }

      router.refresh();
      toast.success(toastMessage);
      router.push("/blogs");
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      await axiosInstance.delete(`/api/blogs/${params?.blogId}`);

      router.refresh();
      router.push(`/blogs`);
      toast.success("Blog deleted.");
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={initialData ? "Edit Blog" : "Create Blog"}
          description={initialData ? "Edit a Blog" : "Add a new Blog"}
        />

        {initialData && (
          <Button
            disabled={loading}
            variant={"destructive"}
            size={"icon"}
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Images </FormLabel>
                <FormControl>
                  <MultipleFileUpload
                    endpoint="imageUploader"
                    value={field.value.map(
                      (image: { url: string }) => image.url
                    )}
                    onChange={(urls: string[]) =>
                      field.onChange(urls.map((url) => ({ url })))
                    }
                    onRemove={(url) =>
                      field.onChange(
                        field.value.filter((current) => current.url !== url)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Title </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Blog Title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> {`content </>`} </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled
                      placeholder=""
                      className="min-h-28"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mins_read"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Duration </FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select duration"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {minsReadData.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <div className="flex items-center gap-x-2">
                            {item.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
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
          <Button disabled={loading} className="ml-auto" type="submit">
            Save Changes
          </Button>
        </form>
      </Form>
    </>
  );
};

export default BlogForm;
