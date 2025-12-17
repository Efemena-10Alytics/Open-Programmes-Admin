"use client";
import { ImagePlus, X } from "lucide-react";
import { UploadDropzone } from "@/utils/uploadthing";
import "@uploadthing/react/styles.css";
import { Button } from "../ui/button";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface FileUploadProps {
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
  value: string[];
  endpoint: "imageUploader";
}

export const MultipleFileUpload: React.FC<FileUploadProps> = ({
  endpoint,
  onChange,
  onRemove,
  value,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleUploadComplete = (res: { url: string }[]) => {
    const urls = res.map((image) => image.url);
    onChange([...value, ...urls]); // Merge existing and new URLs
    setIsPopoverOpen(false); // Close the Popover after upload is complete
  };

  return (
    <div className="flex flex-wrap gap-4">
      {value.length > 0 &&
        value.map((url) => (
          <div key={url} className="relative h-20 w-20">
            <picture>
              <img
                src={url}
                alt="Uploaded file"
                className="rounded-full h-20 w-20"
              />
            </picture>
            <button
              onClick={() => onRemove(url)}
              className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
              type="button"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      <div className="relative">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant={"secondary"}>
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload an image
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <UploadDropzone
              className="bg-white"
              endpoint={endpoint}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error: Error) => {
                console.error("UploadThing upload error:", error);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
