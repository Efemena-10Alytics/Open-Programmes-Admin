"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Course } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { axiosInstance } from "@/utils/axios";

interface AssignCoursesFormProps {
  facilitatorId: string;
  allCourses: Course[];
  assignedCourses: Course[];
}

export function AssignCoursesForm({
  facilitatorId,
  allCourses,
  assignedCourses,
}: AssignCoursesFormProps) {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    assignedCourses.map((c) => c.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const response = await axiosInstance.patch(
        `/api/facilitators/${facilitatorId}`,
        {
          courseIds: selectedCourses,
        }
      );

      if (response.status === 200) {
        toast.success("Courses assigned successfully");
        router.push(`/facilitators/${facilitatorId}`);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || 
        "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
          <CardDescription>
            Select the courses this facilitator will teach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allCourses.map((course) => (
              <div key={course.id} className="flex items-center space-x-2">
                <Checkbox
                  id={course.id}
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={() => handleCourseToggle(course.id)}
                />
                <label
                  htmlFor={course.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {course.title}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/facilitators/${facilitatorId}`)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}