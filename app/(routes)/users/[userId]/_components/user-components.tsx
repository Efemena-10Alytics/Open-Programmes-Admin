"use client";

import { CourseType, User, CohortType } from "@/types";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, UserCheck, UserX } from "lucide-react";

interface UserComponentProps {
  data: User;
  courses: CourseType[];
}

const roles = [
  { value: "USER", label: "User" },
  { value: "COURSE_ADMIN", label: "Course Admin" },
  { value: "ADMIN", label: "Admin" },
];

const UserComponent = ({ data, courses }: UserComponentProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isUpdatingCohort, setIsUpdatingCohort] = useState(false);
  const [selectedCurrentCohort, setSelectedCurrentCohort] = useState("");
  const [selectedNewCohort, setSelectedNewCohort] = useState("");
  const [availableCohorts, setAvailableCohorts] = useState<CohortType[]>([]);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  const onRoleChange = async (value: string) => {
    try {
      setIsLoading(true);
      axiosInstance
        .patch(`/api/users/${data.id}/update-role`, { role: value })
        .then((response) => {
          if (response?.status === 200) {
            toast.success("Role updated");
            router.refresh();
          }
        });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccountStatus = async () => {
    try {
      setIsTogglingStatus(true);
      const newStatus = !data.inactive;
      
      const response = await axiosInstance.patch(
        `/api/account-status/${data.id}/toggle-status`,
        { inactive: newStatus }
      );

      if (response?.status === 200) {
        toast.success(
          `Account ${newStatus ? 'suspended' : 'activated'} successfully`
        );
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update account status");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const addCourse = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    try {
      setIsAddingCourse(true);
      const response = await axiosInstance.post(
        `/api/users/${data.id}/add-course`,
        { courseId: selectedCourse }
      );

      if (response?.status === 200) {
        toast.success("Course added successfully");
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add course");
    } finally {
      setIsAddingCourse(false);
      setSelectedCourse("");
    }
  };

  const removeCourse = async (courseId: string) => {
    try {
      const confirmRemove = window.confirm("Are you sure you want to remove this course from the user?");
      if (!confirmRemove) return;

      setIsLoading(true);
      const response = await axiosInstance.delete(
        `/api/users/${data.id}/remove-course`,
        { data: { courseId } }
      );

      if (response?.status === 200) {
        toast.success("Course removed successfully");
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove course");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCohort = async () => {
    if (!selectedCurrentCohort || !selectedNewCohort) {
      toast.error("Please select both current and new cohorts");
      return;
    }

    try {
      setIsUpdatingCohort(true);
      const response = await axiosInstance.patch(
        `/api/users/${data.id}/update-cohort`,
        { 
          currentCohortId: selectedCurrentCohort,
          newCohortId: selectedNewCohort
        }
      );

      if (response?.status === 200) {
        toast.success("Cohort updated successfully");
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update cohort");
    } finally {
      setIsUpdatingCohort(false);
      setSelectedCurrentCohort("");
      setSelectedNewCohort("");
    }
  };

  useEffect(() => {
    const fetchAvailableCohorts = async () => {
      if (selectedCurrentCohort) {
        try {
          const currentCohort = data.cohorts?.find(
            c => c.cohortId === selectedCurrentCohort
          );
          
          if (currentCohort) {
            const response = await axiosInstance.get(
              `/api/courses/${currentCohort.cohort.courseId}/cohorts`
            );
            setAvailableCohorts(
              response.data.data.filter(
                (c: CohortType) => c.id !== selectedCurrentCohort
              )
            );
          }
        } catch (error) {
          console.error("Failed to fetch cohorts:", error);
          toast.error("Failed to load available cohorts");
        }
      } else {
        setAvailableCohorts([]);
      }
    };

    fetchAvailableCohorts();
  }, [selectedCurrentCohort, data.cohorts]);

  const availableCourses = courses.filter(
    (course) =>
      !data.course_purchased?.some((purchase) => purchase.courseId === course.id)
  );

  return (
    <div className="w-full space-y-5">
      <div className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {data.inactive ? (
                <ShieldAlert className="h-5 w-5 text-red-500" />
              ) : (
                <Shield className="h-5 w-5 text-green-500" />
              )}
              <span className="font-medium">Account Status:</span>
            </div>
            <Badge 
              variant={data.inactive ? "destructive" : "default"}
              className={`${
                data.inactive 
                  ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200" 
                  : "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {data.inactive ? "SUSPENDED" : "ACTIVE"}
            </Badge>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={data.inactive ? "default" : "destructive"}
                size="sm"
                className={`${
                  data.inactive
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                } transition-all duration-200 font-medium`}
                disabled={isTogglingStatus}
              >
                {data.inactive ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate Account
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend Account
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center space-x-2">
                  {data.inactive ? (
                    <UserCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <UserX className="h-5 w-5 text-red-600" />
                  )}
                  <span>
                    {data.inactive ? "Activate" : "Suspend"} User Account
                  </span>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {data.inactive ? (
                    <>
                      Are you sure you want to <strong>activate</strong> {data.name}&apos;s account? 
                      This will restore their access to all courses and features.
                    </>
                  ) : (
                    <>
                      Are you sure you want to <strong>suspend</strong> {data.name}&apos;s account? 
                      This will prevent them from accessing courses.
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={toggleAccountStatus}
                  className={`${
                    data.inactive
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                  disabled={isTogglingStatus}
                >
                  {isTogglingStatus ? "Processing..." : (data.inactive ? "Activate" : "Suspend")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full">
        <span className="text-sm lg:text-base space-x-1">
          <i className="text-[12px] lg:text-sm">Name:</i>
          <b>{data?.name}</b>
        </span>
        <span className="text-sm lg:text-base space-x-1">
          <i className="text-[12px] lg:text-sm">Email:</i>
          <b>{data?.email}</b>
        </span>
        <span className="text-sm lg:text-base space-x-1">
          <i className="text-[12px] lg:text-sm">Email Verified:</i>
          <b>{format(new Date(data?.emailVerified), "MM/dd/yyyy - hh:mm a")}</b>
        </span>
        <span className="text-sm lg:text-base flex items-center space-x-3">
          <i className="text-[12px] lg:text-sm">Role:</i>
          <Select
            disabled={isLoading}
            onValueChange={(value) => onRoleChange(value)}
          >
            <SelectTrigger>
              <SelectValue defaultValue={data.role} placeholder={data.role} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <div className="flex items-center gap-x-2">{item.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
        <span className="text-sm lg:text-base space-x-1">
          <i className="text-[12px] lg:text-sm">No. of Cohorts:</i>
          <b>{data?.cohorts?.length}</b>
        </span>
        <span className="text-sm lg:text-base space-x-1">
          <i className="text-[12px] lg:text-sm">Course Purchased:</i>
          <b>
            {data?.course_purchased?.map((course, index) => {
              const courseTitle = courses.find(
                (_course) => _course?.id == course.courseId
              )?.title;

              return (
                <span key={index}>
                  {courseTitle}
                  {index < data.course_purchased.length - 1 && ", "}
                </span>
              );
            })}
          </b>
        </span>
        <span className="text-sm lg:text-base space-x-1">
          <i className="text-[12px] lg:text-sm">No. of Ongoing Courses</i>
          <b>{data?.ongoing_courses?.length}</b>
        </span>
        <span className="text-sm lg:text-base space-x-1">
          <i className="text-[12px] lg:text-sm"> No. of Completed Courses </i>
          <b>{data?.completed_courses?.length}</b>
        </span>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Cohort Management</h3>
        {data?.cohorts?.length > 0 ? (
          <div className="space-y-3">
            {data.cohorts.map((userCohort, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
              >
                <div>
                  <p className="font-medium">{userCohort.cohort.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Course: {courses.find(c => c.id === userCohort.cohort.courseId)?.title || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dates: {userCohort.cohort.startDate ? format(new Date(userCohort.cohort.startDate), "MMM d, yyyy") : "Unknown"} - 
                    {userCohort.cohort.endDate ? 
                      format(new Date(userCohort.cohort.endDate), "MMM d, yyyy") : "Ongoing"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status: {userCohort.isPaymentActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Cohort
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <Select
                        value={selectedNewCohort}
                        onValueChange={setSelectedNewCohort}
                        onOpenChange={() => setSelectedCurrentCohort(userCohort.cohortId)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select new cohort" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCohorts.map((cohort) => (
                            <SelectItem key={cohort.id} value={cohort.id}>
                              {cohort.name} ({cohort.startDate ? format(new Date(cohort.startDate), "MMM yyyy") : "Unknown"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={updateCohort}
                        disabled={isUpdatingCohort || !selectedNewCohort}
                        className="w-full"
                      >
                        {isUpdatingCohort ? "Updating..." : "Update Cohort"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No cohort enrollments</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Purchased Courses</h3>
        {data?.course_purchased?.length > 0 ? (
          <div className="space-y-3">
            {data.course_purchased.map((purchase, index) => {
              const course = courses.find(c => c.id === purchase.courseId);
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <div>
                    <p className="font-medium">{course?.title || "Unknown Course"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Purchased: {purchase.createdAt ? format(new Date(purchase.createdAt), "MMM d, yyyy") : "Unknown date"}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCourse(purchase.courseId)}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No courses purchased yet</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Add Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Course to User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={selectedCourse}
                onValueChange={(value) => setSelectedCourse(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={addCourse}
                disabled={isAddingCourse || !selectedCourse}
                className="w-full"
              >
                {isAddingCourse ? "Adding..." : "Add Course"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserComponent;