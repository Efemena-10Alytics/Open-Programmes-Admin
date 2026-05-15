"use client";

import { cloudinaryConfig } from "@/app/config/cloudinary";
import { useCloudinaryUpload } from "@/app/hooks/use-cloudinary-upload";
import { FileIcon, ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface FileUploadProps {
  onChange: (name?: string, url?: string) => void;
  onCancel?: () => void;
  accept?: string;
  maxFileSizeMB?: number;
  description?: string;
}

export const FileUpload = ({
  onChange,
  onCancel,
  accept = "*/*",
  maxFileSizeMB = 25,
  description,
}: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    uploadFile,
    isUploading,
    error: uploadError,
    progress,
    cancelUpload,
  } = useCloudinaryUpload(
    cloudinaryConfig.uploadPreset,
    cloudinaryConfig.cloudName,
    {
      maxFileSizeMB,
      compressBeforeUpload: true,
    },
  );

  const isImage = selectedFile?.type.startsWith("image/");

  const defaultDescription = accept.startsWith("image/")
    ? "Upload a clear image. PNG, JPG, JPEG or WEBP supported."
    : accept.startsWith("video/")
      ? "Upload a video file. MP4, MOV, WEBM and other formats supported."
      : accept.includes("pdf")
        ? "Upload a PDF document."
        : "Upload any supported file type.";
  const uploadDescription = description || defaultDescription;
  const uploadLabel = accept.startsWith("image/")
    ? "Click to choose an image"
    : accept.startsWith("video/")
      ? "Click to choose a video"
      : accept.includes("pdf")
        ? "Click to choose a PDF"
        : "Click to choose a file";

  const uploadSubLabel = accept.startsWith("image/")
    ? "PNG, JPG, JPEG, WEBP supported"
    : accept.startsWith("video/")
      ? "MP4, MOV, WEBM and other video formats supported"
      : accept.includes("pdf")
        ? "PDF documents supported"
        : "Images, PDFs, videos, documents, archives, and more";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(null);
    setUploadedUrl(null);
    setPreviewUrl(null);
    onCancel?.();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      const fileUrl = await uploadFile(selectedFile);

      onChange(selectedFile.name, fileUrl);
      setUploadedUrl(fileUrl);

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file. Please try again.");
    }
  };

  const handleCancel = () => {
    if (isUploading) {
      cancelUpload();
    }
    setUploadedUrl(null);
    onCancel?.();
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="w-full space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{uploadDescription}</p>

      {selectedFile ? (
        <div className="relative overflow-hidden rounded-lg border bg-muted">
          {isImage && previewUrl ? (
            <div className="relative aspect-video w-full">
              <Image
                src={previewUrl}
                alt={selectedFile.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <div className="rounded-full bg-background p-3 shadow-sm">
                <FileIcon className="h-8 w-8 text-muted-foreground" />
              </div>

              <div>
                <p className="max-w-xs truncate text-sm font-medium">
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedFile.type || "Unknown file type"}
                </p>
              </div>
            </div>
          )}

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
          htmlFor="fileUpload"
          className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition hover:bg-muted/60"
        >
          <div className="mb-3 rounded-full bg-background p-3 shadow-sm">
            <Upload className="h-7 w-7 text-muted-foreground" />
          </div>

          <p className="text-sm font-medium">{uploadLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">{uploadSubLabel}</p>
        </label>
      )}

      <input
        type="file"
        id="fileUpload"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {selectedFile && (
        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          <p className="truncate font-medium">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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

      {selectedFile && !uploadedUrl ? (
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
                Upload File
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={isUploading ? handleCancel : handleRemove}
          >
            {isUploading ? "Cancel" : "Remove"}
          </Button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
