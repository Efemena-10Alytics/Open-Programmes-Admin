"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { DateRange } from "react-day-picker";
import { CohortType } from "@/types";

interface CohortFormProps {
  initialData?: CohortType | null;
  courseId: string;
  open: boolean;
  setIsOpen: (open: boolean) => void;
  setInitialData?: any;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  dateRange: z.object({
    startDate: z
      .date()
      .refine((val) => val !== null, { message: "Date is required" }),
    endDate: z.date().nullable().optional(),
  }),
});

const CohortForm = ({
  initialData,
  courseId,
  open,
  setIsOpen,
  setInitialData,
}: CohortFormProps) => {
  const router = useRouter();

  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData ? initialData?.name : "",
      dateRange: {
        startDate: initialData ? initialData?.startDate : new Date(),
        endDate: initialData ? initialData?.endDate : null,
      },
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      //@ts-ignore
      form.setValue("dateRange.startDate", dateRange?.from);
      form.setValue("dateRange.endDate", dateRange?.to || null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (initialData) {
        await axiosInstance.patch(`/api/cohorts/${initialData?.id}`, {
          name: values.name,
          startDate: values.dateRange.startDate,
          endDate: values.dateRange.endDate,
          courseId,
        });
        setInitialData(null);
        toast.success("Cohort Updated");
      } else {
        await axiosInstance.post(`/api/cohorts`, {
          name: values.name,
          startDate: values.dateRange.startDate,
          endDate: values.dateRange.endDate,
          courseId,
        });
        toast.success("Cohort Created");
      }
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open && initialData) {
          setInitialData(null);
        }
        setIsOpen(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {initialData ? "Edit Cohort" : "Create a new Cohort"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4 px-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Cohort Name </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g 'xx_month Cohort'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Date Range </FormLabel>
                  <FormControl>
                    <DatePickerWithRange
                      onChange={handleDateRangeChange}
                      //@ts-ignore
                      value={field.value as DateRange | undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CohortForm;
