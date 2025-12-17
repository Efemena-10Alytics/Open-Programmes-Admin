"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/utils/axios";
import { toast } from "sonner";
import { format } from "date-fns";

interface VideoEngagement {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  moduleTitle: string;
  weekTitle: string;
  isCompleted: boolean;
  lastWatched: Date;
}

interface VideoEngagementTableProps {
  userId: string;
  courses: {
    courseId: string;
    courseTitle: string;
  }[];
}

export const VideoEngagementTable = ({
  userId,
  courses,
}: VideoEngagementTableProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [videoEngagement, setVideoEngagement] = useState<VideoEngagement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCourse) {
      const fetchVideoEngagement = async () => {
        try {
          setLoading(true);
          // Get the user's videos for this course
          const response = await axiosInstance.get(
            `/api/engagement/${userId}/course/${selectedCourse}/videos`
          );

          // The response now includes both video details and progress data
          setVideoEngagement(response.data);
        } catch (error) {
          console.error("Error fetching user's video engagement:", error);
          toast.error("Failed to load user's video engagement data");
        } finally {
          setLoading(false);
        }
      };

      fetchVideoEngagement();
    }
  }, [selectedCourse, userId]);

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedCourse} value={selectedCourse}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a course" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.courseId} value={course.courseId}>
              {course.courseTitle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="w-full h-64 flex items-center justify-center">
          Loading...
        </div>
      ) : videoEngagement.length > 0 ? (
        <Table>
          <TableCaption>Video Engagement Details</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Video Title</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion Rate</TableHead>
              <TableHead>Last Watched</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videoEngagement.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell>{video.moduleTitle}</TableCell>
                <TableCell>
                  {video.isCompleted ? (
                    <span className="text-green-500">Completed</span>
                  ) : (
                    <span className="text-yellow-500">In Progress</span>
                  )}
                </TableCell>
                <TableCell>
                  {video.isCompleted ? (
                    <span className="text-green-500">Completed</span>
                  ) : (
                    <span className="text-yellow-500">In Progress</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(video.lastWatched), "MMM d, yyyy h:mm a")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : selectedCourse ? (
        <div className="w-full h-64 flex items-center justify-center">
          No video engagement data found for this course
        </div>
      ) : (
        <div className="w-full h-64 flex items-center justify-center">
          Please select a course to view video engagement
        </div>
      )}
    </div>
  );
};
