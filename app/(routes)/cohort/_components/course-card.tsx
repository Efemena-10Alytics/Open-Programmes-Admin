"use client";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseType } from "@/types";
import Link from "next/link";

interface CourseCardType {
  course: CourseType | null;
}

export const CourseCard = ({ course }: CourseCardType) => {
  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium"> {course?.title} </CardTitle>
        <span className="text-lg">
          No. Of Cohorts: {course?.cohorts?.length}
        </span>
      </CardHeader>
      <CardFooter>
        <Button>
          <Link href={`/cohort/${course?.id}`}>View Cohorts</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
