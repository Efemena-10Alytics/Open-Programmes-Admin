"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "./progress";
import { format } from "date-fns";

interface OverallEngagementCardProps {
  courseTitle: string;
  videoCompletion: number;
  quizCompletion: number;
  lastActivity?: Date | string | null;
}

export const OverallEngagementCard = ({
  courseTitle,
  videoCompletion,
  quizCompletion,
  lastActivity,
}: OverallEngagementCardProps) => {
  // Safely parse the last activity date
  const getFormattedDate = () => {
    if (!lastActivity) return "No activity yet";

    try {
      const date =
        lastActivity instanceof Date ? lastActivity : new Date(lastActivity);
      return format(date, "MMM d, yyyy h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{courseTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Video Completion</p>
          <Progress value={videoCompletion} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(videoCompletion)}% complete
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Quiz Completion</p>
          <Progress value={quizCompletion} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(quizCompletion)}% complete
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          Last activity: {getFormattedDate()}
        </div>
      </CardContent>
    </Card>
  );
};
