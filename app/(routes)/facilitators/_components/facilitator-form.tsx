"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCloudinaryUpload } from "../../../hooks/use-cloudinary-upload";
import { cloudinaryConfig } from "../../../config/cloudinary";
import { useState } from "react";
import { Course } from "@/types";
import Image from "next/image";
import { axiosInstance } from "@/utils/axios";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  phoneNumber: z.string().min(6, {
    message: "Phone number must be at least 6 characters.",
  }),
  title: z.string().optional(),
  bio: z.string().optional(),
  courseIds: z.array(z.string()).default([]),
});

interface FacilitatorFormProps {
  courses: Course[];
  facilitator?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    title?: string;
    bio?: string;
    imageUrl?: string;
    courses: { id: string }[];
  };
}

export function FacilitatorForm({
  courses = [],
  facilitator,
}: FacilitatorFormProps) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    facilitator?.imageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    uploadImage,
    isUploading,
    error: uploadError,
  } = useCloudinaryUpload(
    cloudinaryConfig.uploadPreset,
    cloudinaryConfig.cloudName
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: facilitator?.name || "",
      email: facilitator?.email || "",
      phoneNumber: facilitator?.phoneNumber || "",
      title: facilitator?.title || "",
      bio: facilitator?.bio || "",
      courseIds: facilitator?.courses?.map((c) => c.id) || [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      let imageUrl = facilitator?.imageUrl || null;

      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (err) {
          console.error("Failed to upload image:", err);
          toast.error("Failed to upload image");
        }
      }

      const data = {
        ...values,
        imageUrl,
      };

      if (facilitator) {
        const response = await axiosInstance.patch(
          `/api/facilitators/${facilitator.id}`,
          data
        );

        if (response.status === 200) {
          toast.success("Facilitator updated successfully");
          router.push("/facilitators");
          router.refresh();
        }
      } else {
        const response = await axiosInstance.post("/api/facilitators", data);

        if (response.status === 201) {
          toast.success("Facilitator created successfully");
          router.push("/facilitators");
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const courseOptions =
    courses?.map((course) => ({
      value: course.id,
      label: course.title || `Course ${course.id}`,
    })) || [];

  const selectedCourses = courseOptions.filter((course) =>
    form.watch("courseIds")?.includes(course.value)
  );

  const availableCourses = courseOptions.filter(
    (course) => !form.watch("courseIds")?.includes(course.value)
  );

  const handleAddCourse = (courseId: string) => {
    const currentCourses = form.getValues("courseIds") || [];
    if (!currentCourses.includes(courseId)) {
      form.setValue("courseIds", [...currentCourses, courseId]);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    const currentCourses = form.getValues("courseIds") || [];
    form.setValue(
      "courseIds",
      currentCourses.filter((id) => id !== courseId)
    );
  };

  console.log("Course options:", courseOptions);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-200">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="profileImage"
                  className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title/Role</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Senior Instructor, Data Scientist, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about the facilitator..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Courses</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {/* Selected Courses Display */}
                      {selectedCourses.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedCourses.map((course) => (
                            <Badge
                              key={course.value}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {course.label}
                              <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => handleRemoveCourse(course.value)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Course Selection Dropdown */}
                      {availableCourses.length > 0 ? (
                        <Select onValueChange={handleAddCourse}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Add a course..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCourses.map((course) => (
                              <SelectItem key={course.value} value={course.value}>
                                {course.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        courseOptions.length > 0 && (
                          <p className="text-sm text-gray-500">
                            All available courses have been selected
                          </p>
                        )
                      )}

                      {courseOptions.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No courses available
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select the courses this facilitator will teach
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/facilitators")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting || isUploading
              ? "Saving..."
              : facilitator
              ? "Update Facilitator"
              : "Create Facilitator"}
          </Button>
        </div>
      </form>
    </Form>
  );
}