"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

interface CourseEngagementChartProps {
  data: EngagementData[];
}

export const CourseEngagementChart = ({ data }: CourseEngagementChartProps) => {
  const chartData = data.map(course => ({
    name: course.courseTitle,
    videos: course.videoCompletionRate,
    quizzes: course.quizCompletionRate,
    total: (course.videoCompletionRate + course.quizCompletionRate) / 2
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Engagement Overview</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="videos" fill="#8884d8" name="Video Completion" />
            <Bar dataKey="quizzes" fill="#82ca9d" name="Quiz Completion" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};