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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/utils/axios";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Manually define user roles from your schema
const USER_ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "COURSE_ADMIN", label: "Course Admin" },
  { value: "USER", label: "User" },
] as const;

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  phone_number: z.string().optional(),
  role: z.enum(USER_ROLES.map(role => role.value) as [string, ...string[]], {
    message: "Please select a role.",
  }),
  courseId: z.string().min(1, {
    message: "Please select a course.",
  }),
  cohortId: z.string().min(1, {
    message: "Please select a cohort.",
  }),
});

export function AddUserModal({ courses, cohorts }: { courses: any[], cohorts: any[] }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [alert, setAlert] = React.useState<{
    title: string;
    description: string;
    variant: "default" | "destructive";
  } | null>(null);
  const [missingFields, setMissingFields] = React.useState<string[]>([]);
  
  // Track filtered cohorts based on selected course
  const [filteredCohorts, setFilteredCohorts] = React.useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      role: "USER",
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
      if (form.getValues("cohortId") && !filtered.some(c => c.id === form.getValues("cohortId"))) {
        form.setValue("cohortId", "");
      }
    } else {
      setFilteredCohorts([]);
      form.setValue("cohortId", "");
    }
  }, [selectedCourseId, cohorts]);

  const validateForm = () => {
    const values = form.getValues();
    const errors: string[] = [];
    
    if (!values.name || values.name.length < 2) {
      errors.push("name");
    }
    
    if (!values.email || !z.string().email().safeParse(values.email).success) {
      errors.push("email");
    }

    if (!values.phone_number) {
      errors.push("phone_number");
    }
    
    if (!values.role) {
      errors.push("role");
    }
    
    if (!values.courseId) {
      errors.push("courseId");
    }
    
    if (!values.cohortId) {
      errors.push("cohortId");
    }
    
    setMissingFields(errors);
    return errors.length === 0;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!validateForm()) {
        setAlert({
          title: "Missing Fields",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);
      setAlert(null);
      
      const response = await axiosInstance.post("/api/admin/users", values);
      
      if (response.status === 201) {
        setAlert({
          title: "Success",
          description: "User created successfully. Credentials have been sent to their email.",
          variant: "default"
        });
        form.reset();
        setTimeout(() => {
          setOpen(false);
        }, 2000);
      }
    } catch (error: any) {
      setAlert({
        title: "Error",
        description: error.response?.data?.error || "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const isFieldMissing = (fieldName: string) => missingFields.includes(fieldName);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className={isFieldMissing("name") ? "border-destructive" : ""}
                      />
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
                      <Input 
                        placeholder="john@example.com" 
                        {...field} 
                        className={isFieldMissing("email") ? "border-destructive" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone_number"
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
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={isFieldMissing("role") ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={isFieldMissing("courseId") ? "border-destructive" : ""}>
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
                      disabled={!selectedCourseId} // Disable if no course is selected
                    >
                      <FormControl>
                        <SelectTrigger className={isFieldMissing("cohortId") ? "border-destructive" : ""}>
                          <SelectValue placeholder={selectedCourseId ? "Select a cohort" : "Select a course first"} />
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
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}