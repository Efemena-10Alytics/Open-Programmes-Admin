"use client";

import { CohortType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Upload } from "lucide-react";
import { useState } from "react";
import AlertModal from "@/components/modals/alert-modal";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { toast } from "sonner";
import CohortForm from "./cohort-form";
import CohortCourseWeekForm from "./cohort-course-weeks-form";
import CohortCourseTimeTableList from "./cohort-timetable-list";
import CohortBrochureUpload from "./cohort-brochure-upload";

interface CellActionProps {
  data: CohortType;
}

const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [initialData, setInitialData] = useState<CohortType | null>(null);

  const courseWeeks = data.cohortCourses?.[0]?.cohortWeeks;
  const courseTimetable = data.cohortCourses?.[0]?.cohortTimeTable;

  const [editModal, setEditModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [cohortCourseWeekModal, setCohortCourseWeekModal] = useState(false);
  const [brochureUploadModal, setBrochureUploadModal] = useState(false);
  const [cohortCourseTimetableModal, setCohortCourseTimetableModal] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);

      await axiosInstance.delete(`/api/cohorts/${data.id}`);

      router.refresh();
      toast.success("Cohort Deleted.");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBrochureUploadSuccess = (brochureUrl: string) => {
    toast.success("Brochure updated!");
    router.refresh();
  };

  return (
    <>
      {editModal && (
        <CohortForm
          initialData={data}
          courseId={data?.courseId!}
          open={editModal}
          setIsOpen={setEditModal}
          setInitialData={setInitialData}
        />
      )}

      {cohortCourseWeekModal && (
        <CohortCourseWeekForm
          cohortId={data?.id}
          courseWeeks={courseWeeks!}
          open={cohortCourseWeekModal}
          setIsOpen={setCohortCourseWeekModal}
        />
      )}

      {cohortCourseTimetableModal && (
        <CohortCourseTimeTableList
          cohortId={data?.id}
          cohortTimetable={courseTimetable!}
          open={cohortCourseTimetableModal}
          setIsOpen={setCohortCourseTimetableModal}
        />
      )}

      {brochureUploadModal && (
        <CohortBrochureUpload
          cohortId={data.id}
          open={brochureUploadModal}
          setIsOpen={setBrochureUploadModal}
          onUploadSuccess={handleBrochureUploadSuccess}
        />
      )}

      <AlertModal
        isOpen={confirmationModal}
        onClose={() => setConfirmationModal(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      {/* Single Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-4 w-8 p-0">
            <span className="sr-only"> Open Menu </span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <span
              className="flex items-center cursor-pointer"
              onClick={() => {
                setInitialData(data);
                setEditModal(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Cohort
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span
              className="flex items-center cursor-pointer"
              onClick={() => setCohortCourseWeekModal(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Update Cohort Weeks
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span
              className="flex items-center cursor-pointer"
              onClick={() => setCohortCourseTimetableModal(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Update Cohort Timetable
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span
              className="flex items-center cursor-pointer"
              onClick={() => setBrochureUploadModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Onboarding Brochure
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span
              className="flex items-center cursor-pointer text-red-600"
              onClick={() => setConfirmationModal(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;
