"use client";

import { UploadDropzone } from "@/utils/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";

interface FileUploadProps {
  onChange: (name?: string, url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ endpoint, onChange }: FileUploadProps) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res[0]?.name, res[0]?.url);
      }}
      onUploadError={(error: Error) => {
        console.error("UploadThing upload error:", error);
        toast.error(`${error?.message}` || "Something went wrong");
      }}
    />
  );
};
