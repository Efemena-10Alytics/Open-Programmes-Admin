"use client";

import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageIcon, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { CourseType } from "@/types";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useCloudinaryUpload } from "../../../../hooks/use-cloudinary-upload";
import { cloudinaryConfig } from "../../../../config/cloudinary";

const formSchema = z.object({
  imageUrl: z.string().min(2, { message: "Image is required" }),
});

interface ImageFormProps {
  initialData: CourseType | null;
  courseId: string | undefined;
}

const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize Cloudinary upload hook
  const {
    uploadImage,
    isUploading,
    error: uploadError,
    progress,
    cancelUpload,
  } = useCloudinaryUpload(
    cloudinaryConfig.uploadPreset,
    cloudinaryConfig.cloudName,
    {
      maxFileSizeMB: 10,
      compressBeforeUpload: true,
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      },
    }
  );

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const toggleEdit = () => {
    setIsEditing((current) => !current);
    // Reset states when toggling
    if (isEditing) {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      const imageUrl = await uploadImage(imageFile);
      await onSubmit({ imageUrl });
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handleCancel = () => {
    if (isUploading) {
      cancelUpload();
    }
    toggleEdit();
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosInstance.patch(`/api/courses/${initialData?.id}`, values);
      toast.success("Course Updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Image / Icon
        <Button onClick={handleCancel} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData?.imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an Image
            </>
          )}
          {!isEditing && initialData?.imageUrl && (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              Edit Image
            </>
          )}
        </Button>
      </div>

      {!isEditing &&
        (!initialData?.imageUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
             <img src={initialData.imageUrl} alt="Uploaded Image" className="object-cover rounded-md" />
          </div>
        ))}

      {isEditing && (
        <div className="space-y-4">
          <div className="mt-4">
            <div className="flex flex-col items-center gap-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative aspect-video w-full max-w-md">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}

              {/* File Input */}
              <div className="w-full max-w-md">
                <input
                  type="file"
                  id="courseImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
                <label
                  htmlFor="courseImage"
                  className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                    isUploading
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {isUploading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">
                        Uploading... {progress}%
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {imageFile ? "Change Image" : "Choose an image"}
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Button */}
              {imageFile && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full max-w-md"
                >
                  {isUploading ? `Uploading... ${progress}%` : "Upload Image"}
                </Button>
              )}

              {/* Error Display */}
              {uploadError && (
                <div className="text-red-600 text-sm mt-2 text-center">
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-4">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageForm;
