"use client";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageIcon, PlusCircle } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";
import { CourseType } from "@/types";
import { toast } from "sonner";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  course_instructor_image: z.string().min(2, { message: "Image is required" }),
});

interface ImageFormProps {
  initialData: CourseType | null;
  courseId: string | undefined;
}

const InstructorImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosInstance.patch(`/api/courses/${courseId}`, values);
      toast.success("Course Instructor Updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <>
    <div className="mt-6">
      <div className="font-medium flex items-center justify-between">
        Instructor Image
        <Button type="button" onClick={toggleEdit} variant={"ghost"}>
          {isEditing && <> Cancel </>}

          {!isEditing && !initialData?.course_instructor_image && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an Image
            </>
          )}

          {!isEditing && initialData?.course_instructor_image && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Edit Image
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData?.course_instructor_image ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              src={initialData?.course_instructor_image}
              alt="upload"
              fill
              className="object-cover rounded-md"
            />
          </div>
        ))}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="imageUploader"
            onChange={(url: string | undefined) => {
              if (url) {
                onSubmit({ course_instructor_image: url });
              }
            }}
          />
          <div className="text-sm text-muted-foreground mt-4">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default InstructorImageForm;
