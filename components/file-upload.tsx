"use client";

import { cloudinaryConfig } from "@/app/config/cloudinary";
import { useCloudinaryUpload } from "@/app/hooks/use-cloudinary-upload";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface FileUploadProps {
  onChange: (name?: string, url?: string) => void;
  onCancel?: () => void;
}

export const FileUpload = ({ onChange, onCancel }: FileUploadProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    },
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImageFile(null);
    setImagePreview(null);
    onCancel?.();
  };

  const handleUpload = async () => {
    if (!imageFile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      const imageUrl = await uploadImage(imageFile);
      onChange(imageFile.name, imageUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handleCancel = () => {
    if (isUploading) {
      cancelUpload();
    }
    onCancel?.();
  };

  return (
    <div className="w-full space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div>
        <p className="text-xs text-muted-foreground">
          Upload a clear image. 16:9 aspect ratio is recommended.
        </p>
      </div>

      {imagePreview ? (
        <div className="relative overflow-hidden rounded-lg border bg-muted">
          <div className="relative aspect-video w-full">
            <Image
              src={imagePreview}
              alt="Selected course image"
              fill
              className="object-cover"
            />
          </div>

          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor="courseImage"
          className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition hover:bg-muted/60"
        >
          <div className="mb-3 rounded-full bg-background p-3 shadow-sm">
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
          </div>

          <p className="text-sm font-medium">Click to choose an image</p>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, JPEG or WEBP up to 10MB
          </p>
        </label>
      )}

      <input
        type="file"
        id="courseImage"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        disabled={isUploading}
      />

      {imageFile && (
        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          <p className="truncate font-medium">{imageFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {(imageFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {uploadError && (
        <p className="text-center text-sm text-destructive">{uploadError}</p>
      )}

      {imageFile && (
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>

          {isUploading ? (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleRemove}>
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
