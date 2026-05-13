"use client";

import { FileIcon, X, PlayCircle } from "lucide-react";
import { UploadDropzone } from "@/utils/uploadthing";
import { OurFileRouter } from "@/app/api/uploadthing/core";

import "@uploadthing/react/styles.css";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: keyof OurFileRouter;
}

const videoExtensions = ["mp4", "webm", "mov", "avi", "mkv"];
const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

export const FileUpload: React.FC<FileUploadProps> = ({
  endpoint,
  onChange,
  value,
}) => {
  const fileType = value?.split(".").pop()?.toLowerCase();

  const isVideo = fileType && videoExtensions.includes(fileType);
  const isImage = fileType && imageExtensions.includes(fileType);
  const isPdf = fileType === "pdf";

  // IMAGE
  if (value && isImage) {
    return (
      <div className="relative h-24 w-24">
        <picture>
          <img
            src={value}
            alt="upload"
            className="rounded-md h-24 w-24 object-cover"
          />
        </picture>

        <button
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // VIDEO
  if (value && isVideo) {
    return (
      <div className="relative w-full max-w-sm overflow-hidden rounded-md border bg-black">
        <video src={value} controls className="w-full h-auto max-h-[250px]" />

        <button
          className="bg-rose-500 text-white p-1 rounded-full absolute top-2 right-2 shadow-sm"
          type="button"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded flex items-center gap-1 text-xs">
          <PlayCircle className="h-3 w-3" />
          Video
        </div>
      </div>
    );
  }

  // PDF
  if (value && isPdf) {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />

        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline truncate"
        >
          Open PDF
        </a>

        <button
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0]?.url);
      }}
      onUploadError={(error: Error) => {
        console.error("UploadThing upload error:", error);
      }}
    />
  );
};
