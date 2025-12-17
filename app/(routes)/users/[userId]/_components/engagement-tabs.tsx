"use client";

import { useEffect, useState } from "react";
import { CourseEngagementChart } from "./course-engagement-chart";
import { VideoEngagementTable } from "./video-engagement-table";
import { OverallEngagementCard } from "./overall-engagement-card";
import { axiosInstance } from "@/utils/axios";
import { toast } from "sonner";

interface EngagementData {
  courseId: string;
  courseTitle: string;
  totalVideos: number;
  totalQuizzes: number;
  videosCompleted: number;
  quizzesCompleted: number;
  videoCompletionRate: number;
  quizCompletionRate: number;
  lastActivity?: Date;
}

export const EngagementTabs = ({ userId }: { userId: string }) => {
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/engagement/${userId}`);
        setEngagementData(response.data);
      } catch (error) {
        console.error("Error fetching engagement data:", error);
        toast.error("Failed to load engagement data");
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();
  }, [userId]);

  if (loading) {
    return <div className="w-full h-64 flex items-center justify-center">Loading...</div>;
  }

  if (!engagementData.length) {
    return <div className="w-full h-64 flex items-center justify-center">No engagement data found</div>;
  }

  return (
    <div className="w-full mt-6">
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "overview" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "courses" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("courses")}
        >
          Course Engagement
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "videos" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("videos")}
        >
          Video Analytics
        </button>
      </div>
      
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {engagementData.map(course => (
            <OverallEngagementCard 
              key={course.courseId}
              courseTitle={course.courseTitle}
              videoCompletion={course.videoCompletionRate}
              quizCompletion={course.quizCompletionRate}
              lastActivity={course.lastActivity}
            />
          ))}
        </div>
      )}
      
      {activeTab === "courses" && (
        <CourseEngagementChart data={engagementData} />
      )}
      
      {activeTab === "videos" && (
        <VideoEngagementTable userId={userId} courses={engagementData} />
      )}
    </div>
  );
};