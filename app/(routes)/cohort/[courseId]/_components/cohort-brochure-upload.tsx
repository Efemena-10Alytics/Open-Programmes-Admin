"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { axiosInstance } from "@/utils/axios";

interface CohortBrochureUploadProps {
  cohortId: string;
  open: boolean;
  setIsOpen: (open: boolean) => void;
  onUploadSuccess?: (brochureUrl: string) => void;
}

const CohortBrochureUpload = ({ cohortId, open, setIsOpen, onUploadSuccess }: CohortBrochureUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file to upload");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("brochure", file);

      const res = await axiosInstance.post(`/api/cohorts/${cohortId}/brochure`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Brochure uploaded successfully");
      if (onUploadSuccess) onUploadSuccess(res.data.brochureUrl);
      setIsOpen(false);
      setFile(null);
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Onboarding Brochure PDF</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <div>
            <Button onClick={handleUpload} disabled={loading || !file}>
              {loading ? "Uploading..." : "Upload Brochure"}
            </Button>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="ml-2">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CohortBrochureUpload;
