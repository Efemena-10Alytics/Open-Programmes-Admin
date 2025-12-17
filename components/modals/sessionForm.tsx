"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { axiosInstance } from "@/utils/axios";

interface SessionFormData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  sessionLink: string;
}

export function SessionForm() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<SessionFormData>({
    defaultValues: {
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour later
    }
  });

  const onSubmit = async (data: SessionFormData) => {
    if (data.startTime >= data.endTime) {
      alert("End time must be after start time");
      return;
    }

    try {
      await axiosInstance.post("/api/sessions", data);
      alert("Session created successfully!");
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create Session</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <DateTimePicker
                  value={watch("startTime")}
                  onChange={(date) => date && setValue("startTime", date)}
                  granularity="minute"
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm">Start time is required</p>
                )}
              </div>

              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <DateTimePicker
                  value={watch("endTime")}
                  onChange={(date) => date && setValue("endTime", date)}
                  granularity="minute"
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm">End time is required</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="sessionLink">Session Link *</Label>
              <Input
                id="sessionLink"
                {...register("sessionLink", { required: "Session link is required" })}
              />
              {errors.sessionLink && (
                <p className="text-red-500 text-sm">{errors.sessionLink.message}</p>
              )}
            </div>

            <Button type="submit" className="mt-4">
              Create Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}