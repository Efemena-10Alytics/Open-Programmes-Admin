"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/utils/axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CohortType } from "@/types";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});

interface CohortFormProps {
    courseId: string;
    initialData?: CohortType | null;
    open: boolean;
    setIsOpen: (open: boolean) => void;
    setInitialData?: (data: CohortType | null) => void;
}

export default function CohortForm({
    courseId,
    initialData,
    open,
    setIsOpen,
    setInitialData,
}: CohortFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [alert, setAlert] = React.useState<{
        title: string;
        description: string;
        variant: "default" | "destructive";
    } | null>(null);

    const defaultValues = React.useMemo(() => {
        return initialData
            ? {
                name: initialData.name,
                startDate: initialData.startDate
                    ? new Date(initialData.startDate).toISOString().split("T")[0]
                    : "",
                endDate: initialData.endDate
                    ? new Date(initialData.endDate).toISOString().split("T")[0]
                    : "",
            }
            : {
                name: "",
                startDate: "",
                endDate: "",
            };
    }, [initialData]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: "onChange",
    });

    // Reset form when initialData changes
    React.useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            setAlert(null);

            const payload = {
                ...values,
                courseId,
                startDate: new Date(values.startDate).toISOString(),
                endDate: new Date(values.endDate).toISOString(),
            };

            let response;
            if (initialData) {
                response = await axiosInstance.patch(`/api/cohorts/${initialData.id}`, payload);
            } else {
                response = await axiosInstance.post(`/api/cohorts`, payload);
            }

            // Check for 200/201 (Created/OK)
            if (response.status === 201 || response.status === 200) {
                setAlert({
                    title: "Success",
                    description: initialData
                        ? "Cohort updated successfully"
                        : "Cohort created successfully",
                    variant: "default",
                });

                setTimeout(() => {
                    setIsOpen(false);
                    if (setInitialData) setInitialData(null);
                    // Reload to refresh the DataTable
                    window.location.reload();
                }, 1500);
            }
        } catch (error: any) {
            console.error("Error submitting cohort:", error);
            setAlert({
                title: "Error",
                description: error.response?.data?.error || "Failed to submit cohort",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setIsOpen(false);
            if (setInitialData) setInitialData(null);
            setAlert(null);
            form.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Cohort" : "Create New Cohort"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {alert && (
                            <Alert variant={alert.variant}>
                                <AlertTitle>{alert.title}</AlertTitle>
                                <AlertDescription>{alert.description}</AlertDescription>
                            </Alert>
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cohort Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Cohort 1 - 2024" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Saving..." : initialData ? "Save Changes" : "Create Cohort"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
