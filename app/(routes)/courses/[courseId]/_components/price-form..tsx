"use client";
import * as z from "zod";
import axios from "axios";
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
import { Pencil } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CourseType, CoursePricingPlanType } from "@/types";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import { Plus, Trash } from "lucide-react";

const PLAN_TYPES = [
  { label: "Full Payment", value: "FULL_PAYMENT", count: 1 },
  { label: "2 Installments", value: "TWO_INSTALLMENTS", count: 2 },
  { label: "3 Installments", value: "THREE_INSTALLMENTS", count: 3 },
  { label: "4 Installments", value: "FOUR_INSTALLMENTS", count: 4 },
  { label: "5 Installments", value: "FIVE_INSTALLMENTS", count: 5 },
];

const formSchema = z.object({
  price: z.string().min(1, { message: "Base Price is required" }),
  pricingPlans: z.array(z.object({
    planType: z.string(),
    amountPerInstallment: z.number().min(0),
    installmentsCount: z.number().min(1),
    discountPrice: z.number().optional(),
  })),
});

interface PriceFormProps {
  initialData: CourseType | null;
  courseId: string | undefined;
}

const PriceForm = ({ initialData, courseId }: PriceFormProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  if (session?.accessToken) {
    setAuthToken(session.accessToken);
  }

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: initialData?.price || "",
      pricingPlans: initialData?.pricingPlans?.map(p => ({
        planType: p.planType,
        amountPerInstallment: p.amountPerInstallment,
        installmentsCount: p.installmentsCount,
        discountPrice: p.discountPrice || undefined,
      })) || [],
    },
  });
  
  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosInstance.patch(`/api/courses/${courseId}`, values);
      toast.success("Course Pricing Updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  const addPlan = (plan: typeof PLAN_TYPES[0]) => {
    const currentPlans = form.getValues("pricingPlans");
    if (currentPlans.some(p => p.planType === plan.value)) return;

    form.setValue("pricingPlans", [
      ...currentPlans,
      {
        planType: plan.value,
        amountPerInstallment: 0,
        installmentsCount: plan.count,
        discountPrice: undefined,
      }
    ]);
  };

  const removePlan = (planType: string) => {
    const currentPlans = form.getValues("pricingPlans");
    form.setValue("pricingPlans", currentPlans.filter(p => p.planType !== planType));
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course Pricing & Plans
        <Button type="button" onClick={toggleEdit} variant={"ghost"}>
          {isEditing ? (
            <> Cancel </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Pricing
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className="space-y-2 mt-2">
          <p className={cn("text-sm", !initialData?.price && "text-slate-500 italic")}>
            <strong>Base Price:</strong> {initialData?.price ? `₦${initialData?.price}` : "No price"}
          </p>
          <div className="text-sm">
            <strong>Active Plans:</strong>
            {initialData?.pricingPlans && initialData.pricingPlans.length > 0 ? (
              <ul className="list-disc list-inside mt-1 text-slate-700">
                {initialData.pricingPlans.sort((a,b) => a.installmentsCount - b.installmentsCount).map((plan) => (
                  <li key={plan.id}>
                    {plan.planType.replace("_", " ")}: ₦{plan.amountPerInstallment} x {plan.installmentsCount} 
                    {plan.discountPrice && <span className="text-xs text-slate-500 ml-2">(Original: ₦{plan.discountPrice})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No installment plans set</p>
            )}
          </div>
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Base Display Price </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} placeholder="e.g. 250000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Installment Plans</FormLabel>
              <div className="flex flex-wrap gap-2">
                {PLAN_TYPES.map((plan) => (
                  <Button
                    key={plan.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPlan(plan)}
                    disabled={form.watch("pricingPlans").some(p => p.planType === plan.value)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {plan.label}
                  </Button>
                ))}
              </div>

              {form.watch("pricingPlans").map((plan, index) => (
                <div key={plan.planType} className="bg-white p-3 rounded-md border space-y-3 relative">
                  <button 
                    type="button"
                    onClick={() => removePlan(plan.planType)}
                    className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                  <div className="font-semibold text-sm">{plan.planType.replace("_", " ")}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`pricingPlans.${index}.amountPerInstallment`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Price Per Installment</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`pricingPlans.${index}.discountPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Original Per Installment (Display Only)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ""}
                              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Save All
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PriceForm;
