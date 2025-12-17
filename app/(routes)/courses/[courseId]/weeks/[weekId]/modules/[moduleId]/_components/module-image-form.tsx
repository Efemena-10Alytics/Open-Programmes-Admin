"use client";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageIcon, PlusCircle } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";
import { ModuleType } from "@/types";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { axiosInstance, setAuthToken } from "@/utils/axios";

const formSchema = z.object({
  iconUrl: z.string().min(2, { message: "Image is required" }),
});

interface ImageFormProps {
  initialData: ModuleType | null;
  courseId: string | undefined;
  moduleId: string | undefined;
  weekId: string | undefined;
}

const ImageForm = ({
  initialData,
  courseId,
  moduleId,
  weekId,
}: ImageFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

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
        Module Image / Icon
        <Button type="button" onClick={toggleEdit} variant={"ghost"}>
          {isEditing && <> Cancel </>}

          {!isEditing && !initialData?.iconUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an Image
            </>
          )}

          {!isEditing && initialData?.iconUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Edit Image
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData?.iconUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              src={initialData?.iconUrl}
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
                onSubmit({ iconUrl: url });
              }
            }}
          />
          <div className="text-sm text-muted-foreground mt-4">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageForm;
