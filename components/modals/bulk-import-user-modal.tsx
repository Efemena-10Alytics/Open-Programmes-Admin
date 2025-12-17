"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { axiosInstance } from "@/utils/axios";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Papa from "papaparse";

const formSchema = z.object({
  userData: z.string().min(1, {
    message: "Please enter user data",
  }),
  courseId: z.string().min(1, {
    message: "Please select a course",
  }),
  cohortId: z.string().min(1, {
    message: "Please select a cohort",
  }),
});

export function BulkImportUserModal({
  courses,
  cohorts,
}: {
  courses: any[];
  cohorts: any[];
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [alert, setAlert] = React.useState<{
    title: string;
    description: string;
    variant: "default" | "destructive";
  } | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<
    Array<{
      line: number;
      errors: string[];
    }>
  >([]);
  const [filteredCohorts, setFilteredCohorts] = React.useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userData: "",
      courseId: "",
      cohortId: "",
    },
  });

  // Watch courseId changes to filter cohorts
  const selectedCourseId = form.watch("courseId");

  React.useEffect(() => {
    if (selectedCourseId) {
      // Filter cohorts that belong to the selected course
      const filtered = cohorts.filter(
        (cohort) => cohort.courseId === selectedCourseId
      );
      setFilteredCohorts(filtered);

      // Reset cohortId if it's no longer valid
      if (
        form.getValues("cohortId") &&
        !filtered.some((c) => c.id === form.getValues("cohortId"))
      ) {
        form.setValue("cohortId", "");
      }
    } else {
      setFilteredCohorts([]);
      form.setValue("cohortId", "");
    }
  }, [selectedCourseId, cohorts]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFile(file);

      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const data = results.data.map((row: any) => ({
            name: row.name || row.fullname || row["Full Name"],
            email: row.email || row["Email Address"],
            phone_number:
              row.phone || row.phone_number || row["Phone Number"] || "",
          }));

          const formattedData = data
            .filter((user: any) => user.name && user.email)
            .map(
              (user: any) =>
                `${user.name},${user.email},${user.phone_number || ""}`
            )
            .join("\n");

          form.setValue("userData", formattedData);
          setValidationErrors([]);
        },
        error: (error) => {
          setAlert({
            title: "File Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  const validateUserData = (userData: string) => {
    const errors: Array<{
      line: number;
      errors: string[];
    }> = [];

    const lines = userData.split("\n").filter((line) => line.trim());

    lines.forEach((line, index) => {
      const lineErrors: string[] = [];
      const lineNumber = index + 1;
      const [name, email, phone_number = ""] = line
        .split(",")
        .map((item) => item.trim());

      if (!name) {
        lineErrors.push("Missing name");
      }

      if (!email) {
        lineErrors.push("Missing email");
      } else if (!z.string().email().safeParse(email).success) {
        lineErrors.push("Invalid email format");
      }

      if (!phone_number) {
        lineErrors.push("Missing phone number");
      }

      if (lineErrors.length > 0) {
        errors.push({
          line: lineNumber,
          errors: lineErrors,
        });
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      setAlert(null);

      if (!values.courseId || !values.cohortId) {
        setAlert({
          title: "Missing Fields",
          description: "Please select both course and cohort",
          variant: "destructive",
        });
        return;
      }

      if (!validateUserData(values.userData)) {
        setAlert({
          title: "Validation Errors",
          description: "Please fix the errors in user data before submitting",
          variant: "destructive",
        });
        return;
      }

      const users = values.userData
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [name, email, phone_number = ""] = line
            .split(",")
            .map((item) => item.trim());
          return { name, email, phone_number };
        });

      const response = await axiosInstance.post("/api/admin/users/bulk", {
        users,
        courseId: values.courseId,
        cohortId: values.cohortId,
      });

      if (response.status === 201) {
        setAlert({
          title: "Success",
          description: `Successfully created ${response.data.success} users. ${
            response.data.failed > 0 ? `${response.data.failed} failed.` : ""
          }`,
          variant: "default",
        });
        form.reset();
        setValidationErrors([]);
        setTimeout(() => {
          setOpen(false);
        }, 3000);
      }
    } catch (error: any) {
      setAlert({
        title: "Error",
        description: error.response?.data?.error || "Failed to create users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Users</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {alert && (
              <Alert variant={alert.variant}>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={!field.value ? "border-black" : ""}
                        >
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cohortId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cohort</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCourseId}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={!field.value ? "border-black" : ""}
                        >
                          <SelectValue
                            placeholder={
                              selectedCourseId
                                ? "Select a cohort"
                                : "Select a course first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCohorts.map((cohort) => (
                          <SelectItem key={cohort.id} value={cohort.id}>
                            {cohort.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload CSV File (Optional)</Label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
              />
              <p className="text-sm text-muted-foreground">
                CSV should have columns: name, email, phone_number
              </p>
            </div>

            <FormField
              control={form.control}
              name="userData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Data</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder={`Enter user data in this format:\nJohn Doe,john@example.com,1234567890\nJane Smith,jane@example.com,1234567878`}
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                      {validationErrors.length > 0 && (
                        <div className="absolute -right-2 top-0 translate-x-full w-64 bg-destructive/90 text-white text-xs p-2 rounded">
                          <div className="font-bold mb-1">
                            Validation Errors:
                          </div>
                          {validationErrors.map((error, idx) => (
                            <div key={idx} className="mb-1">
                              <span className="font-semibold">
                                Line {error.line}:
                              </span>
                              <ul className="list-disc list-inside">
                                {error.errors.map((err, i) => (
                                  <li key={i}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Format: Full Name,Email,Phone - one user per line
                  </p>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Importing..." : "Import Users"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
