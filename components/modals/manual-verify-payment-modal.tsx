"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { axiosInstance } from "@/utils/axios";
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ManualVerifyPaymentModalProps {
  courses: any[];
  onSuccess?: () => void;
}

export function ManualVerifyPaymentModal({
  courses,
  onSuccess,
}: ManualVerifyPaymentModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Form state
  const [reference, setReference] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [courseId, setCourseId] = React.useState("");
  const [installmentNumber, setInstallmentNumber] = React.useState("1");

  // Feedback state
  const [alert, setAlert] = React.useState<{
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  const resetForm = () => {
    setReference("");
    setUserId("");
    setCourseId("");
    setInstallmentNumber("1");
    setAlert(null);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) resetForm();
    setOpen(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !userId.trim() || !courseId) {
      setAlert({
        type: "warning",
        title: "Missing Fields",
        message: "Please fill in the Paystack reference, User ID, and select a course.",
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await axiosInstance.post("/api/admin/payments/manual-verify", {
        reference: reference.trim(),
        userId: userId.trim(),
        courseId,
        installmentNumber: Number(installmentNumber),
      });

      setAlert({
        type: "success",
        title: "Payment Verified ✅",
        message:
          res.data?.message ||
          "The payment has been recorded and the user's access has been granted.",
      });

      if (onSuccess) onSuccess();

      // Auto-close after 3 s on success
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 3000);
    } catch (err: any) {
      const details =
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        "An unexpected error occurred. Please try again.";
      setAlert({
        type: "error",
        title: "Verification Failed",
        message: details,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950">
          <ShieldCheck className="h-4 w-4" />
          Manual Verify Payment
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            Manual Payment Verification
          </DialogTitle>
          <DialogDescription>
            Use this when automatic payment verification failed. Enter the Paystack
            reference and the user details to record the payment manually.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Alert feedback */}
          {alert && (
            <Alert
              variant={alert.type === "error" ? "destructive" : "default"}
              className={
                alert.type === "success"
                  ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400"
                  : alert.type === "warning"
                  ? "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
                  : ""
              }
            >
              {alert.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription className="mt-1 text-sm">{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Paystack Reference */}
          <div className="space-y-1.5">
            <Label htmlFor="mv-reference">
              Paystack Reference <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mv-reference"
              placeholder="e.g. s7myltj1jd"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={loading}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Found in the Paystack dashboard or the user&apos;s payment URL.
            </p>
          </div>

          {/* User ID */}
          <div className="space-y-1.5">
            <Label htmlFor="mv-userId">
              User ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mv-userId"
              placeholder="e.g. cmo5j7tnl00033h7b1c1eka2v"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Found on the user&apos;s profile page in the admin panel.
            </p>
          </div>

          {/* Course */}
          <div className="space-y-1.5">
            <Label>
              Course <span className="text-destructive">*</span>
            </Label>
            <Select value={courseId} onValueChange={setCourseId} disabled={loading}>
              <SelectTrigger id="mv-course">
                <SelectValue placeholder="Select course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Installment Number */}
          <div className="space-y-1.5">
            <Label>Installment Number</Label>
            <Select
              value={installmentNumber}
              onValueChange={setInstallmentNumber}
              disabled={loading}
            >
              <SelectTrigger id="mv-installment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Installment {n}
                    {n === 1 ? " (default / first payment)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select which installment this payment covers. For full payments, leave as 1.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify & Record Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
