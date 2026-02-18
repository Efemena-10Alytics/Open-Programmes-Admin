"use client";

import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { toast } from "sonner";
import { FileUpload } from "@/components/uploadthing/file-uploader";
import { ProjectVideoType } from "@/types";
import { useSession } from "next-auth/react";
import { Youtube, Video, Link, Upload, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekFormProps {
  initialData: ProjectVideoType | null;
  setInitialData: any;
  open: boolean;
  courseId: string | undefined;
  moduleId: string | undefined;
  weekId: string | undefined;
  setIsOpen: (open: boolean) => void;
}

const VIDEO_TYPES = [
  {
    value: "VIMEO",
    label: "Vimeo",
    icon: Video,
    description: "Paste a Vimeo video URL",
    placeholder: "https://vimeo.com/123456789",
    inputType: "url",
  },
  {
    value: "YOUTUBE",
    label: "YouTube",
    icon: Youtube,
    description: "Paste a YouTube video URL",
    placeholder: "https://www.youtube.com/watch?v=...",
    inputType: "url",
  },
  {
    value: "UPLOAD",
    label: "Direct Upload",
    icon: Upload,
    description: "Upload a video file directly",
    placeholder: "",
    inputType: "upload",
  },
  {
    value: "EXTERNAL",
    label: "External URL",
    icon: Link,
    description: "Any other direct video link (MP4, etc.)",
    placeholder: "https://example.com/video.mp4",
    inputType: "url",
  },
] as const;

const formSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  videoType: z.string().min(1, { message: "Video type is required" }),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  duration: z.string().optional(),
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
      videoType: isAddMode ? "VIMEO" : (initialData as any)?.videoType || "VIMEO",
      videoUrl: isAddMode ? "" : initialData?.videoUrl,
      thumbnailUrl: isAddMode ? "" : initialData?.thumbnailUrl,
      duration: isAddMode ? "" : initialData?.duration,
    },
  });

  const { isSubmitting } = form.formState;
  const selectedVideoType = form.watch("videoType");
  const activeType = VIDEO_TYPES.find((t) => t.value === selectedVideoType);

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isAddMode ? "Add New Video" : "Edit Video Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 mt-4"
            >
              {/* Video Type Selector */}
              <FormField
                control={form.control}
                name="videoType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Source</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                      {VIDEO_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = field.value === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              field.onChange(type.value);
                              // Clear videoUrl when switching types
                              form.setValue("videoUrl", "");
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition-all",
                              isSelected
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {activeType && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Info className="w-3 h-3" />
                        {activeType.description}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thumbnail */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
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

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Introduction to React Hooks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Video URL or Upload — conditional on type */}
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedVideoType === "UPLOAD" ? "Video File" : "Video URL"}
                    </FormLabel>
                    <FormControl>
                      {selectedVideoType === "UPLOAD" ? (
                        <FileUpload
                          endpoint="videoUploader"
                          value={field.value!}
                          onChange={field.onChange}
                        />
                      ) : (
                        <Input
                          placeholder={activeType?.placeholder || "https://..."}
                          {...field}
                        />
                      )}
                    </FormControl>
                    {selectedVideoType === "YOUTUBE" && (
                      <FormDescription className="text-xs">
                        Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                      </FormDescription>
                    )}
                    {selectedVideoType === "VIMEO" && (
                      <FormDescription className="text-xs">
                        Supports: vimeo.com/123456789 or player.vimeo.com/video/...
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 30 Mins" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setInitialData(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!form.getFieldState("title").isDirty || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Video"}
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
