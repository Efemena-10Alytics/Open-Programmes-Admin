"use client";

import { useMemo, useState } from "react";
import { CourseType } from "@/types";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    ListChecks,
    ListCollapse,
    Timer,
    UserPlus,
    Currency,
    Users,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
} from "lucide-react";

import TitleForm from "./title-form";
import DescriptionForm from "./description-form.";
import ImageForm from "./image-form";
import PriceForm from "./price-form.";
import InstructorForm from "./instructor-form";
import MiscellenousForm from "./miscellaneous-form";
import TimeTableList from "./timetable-list";
import CourseActions from "./course-actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import IconBadge from "@/components/icon-badge";

interface CourseEditWizardProps {
    course: CourseType;
}

const steps = [
    {
        id: 1,
        label: "Basic Info",
        description: "Title, Description, Image",
    },
    {
        id: 2,
        label: "Cohorts",
        description: "Manage User Groups",
    },
    {
        id: 3,
        label: "Course Details",
        description: "Price, Instructor, Misc",
    },
    {
        id: 4,
        label: "Schedule",
        description: "Timetable & Events",
    },
];

const CourseEditWizard = ({ course }: CourseEditWizardProps) => {
    const [activeStep, setActiveStep] = useState(1);

    // Completion Checks
    const isStep1Complete = useMemo(() => {
        return !!course.title && !!course.description && !!course.imageUrl;
    }, [course]);

    const isStep2Complete = useMemo(() => {
        return course.cohorts && course.cohorts.length > 0;
    }, [course]);

    const isStep3Complete = useMemo(() => {
        // Modify based on actual requirements. Here assuming Price + Instructor Name are key.
        return !!course.price && !!course.course_instructor_name;
    }, [course]);

    const isStep4Complete = useMemo(() => {
        return course.timetable && course.timetable.length > 0;
    }, [course]);

    // Determine which step is accessible
    const canAccessStep = (stepId: number) => {
        if (stepId === 1) return true;
        if (stepId === 2) return isStep1Complete;
        if (stepId === 3) return isStep1Complete && isStep2Complete;
        if (stepId === 4) return isStep1Complete && isStep2Complete && isStep3Complete;
        return false;
    };

    const handleNext = () => {
        if (activeStep < steps.length && canAccessStep(activeStep + 1)) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (activeStep > 1) {
            setActiveStep((prev) => prev - 1);
        }
    };

    return (
        <div className="pt-3 pb-6 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Course Setup</h1>
                    <p className="text-slate-500 text-sm">
                        Complete all steps to publish your course.
                    </p>
                </div>
                <CourseActions courseId={course.id} />
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
                {steps.map((step) => {
                    const isAccessible = canAccessStep(step.id);
                    const isActive = activeStep === step.id;
                    const isCompleted =
                        step.id === 1
                            ? isStep1Complete
                            : step.id === 2
                                ? isStep2Complete
                                : step.id === 3
                                    ? isStep3Complete
                                    : isStep4Complete;

                    return (
                        <button
                            key={step.id}
                            onClick={() => isAccessible && setActiveStep(step.id)}
                            disabled={!isAccessible}
                            className={cn(
                                "flex flex-col items-start min-w-[140px] px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                                isActive
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : isAccessible
                                        ? "bg-white text-slate-900 hover:bg-slate-50 border-slate-200"
                                        : "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100"
                            )}
                        >
                            <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-xs opacity-70">Step {step.id}</span>
                                {isCompleted && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                            </div>
                            <span className="font-semibold">{step.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="mt-6 min-h-[400px]">
                {activeStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-x-2 mb-6">
                            <IconBadge icon={LayoutDashboard} />
                            <h2 className="text-xl font-medium">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TitleForm initialData={course} courseId={course.id} />
                            <DescriptionForm initialData={course} courseId={course.id} />
                            <div className="md:col-span-2">
                                <ImageForm initialData={course} courseId={course.id} />
                            </div>
                        </div>
                    </div>
                )}

                {activeStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-x-2 mb-6">
                            <IconBadge icon={Users} />
                            <h2 className="text-xl font-medium">Cohort Management</h2>
                        </div>

                        <div className="bg-slate-50 border rounded-lg p-8 text-center space-y-4">
                            <div className="bg-white p-4 rounded-full inline-block shadow-sm">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold">
                                {course.cohorts && course.cohorts.length > 0
                                    ? `${course.cohorts.length} Cohort(s) Active`
                                    : "No Cohorts Created"}
                            </h3>
                            <p className="text-slate-600 max-w-md mx-auto">
                                {course.cohorts && course.cohorts.length > 0
                                    ? "You have successfully created cohorts for this course. You can proceed to the next step or manage existing cohorts."
                                    : "You must create at least one cohort to proceed. Cohorts allow you to group students and manage schedules efficiently."}
                            </p>

                            <Link href={`/cohort/${course.id}`}>
                                <Button variant={course.cohorts && course.cohorts.length > 0 ? "outline" : "default"}>
                                    {course.cohorts && course.cohorts.length > 0 ? "Manage Cohorts" : "Create Initial Cohort"}
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {activeStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-x-2 mb-6">
                            <IconBadge icon={ListCollapse} />
                            <h2 className="text-xl font-medium">Course Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center gap-x-2 mb-4">
                                    <IconBadge icon={Currency} />
                                    <h2 className="text-lg">Pricing</h2>
                                </div>
                                <PriceForm initialData={course} courseId={course.id} />
                            </div>

                            <div>
                                <div className="flex items-center gap-x-2 mb-4">
                                    <IconBadge icon={UserPlus} />
                                    <h2 className="text-lg">Instructor</h2>
                                </div>
                                <InstructorForm initialData={course} courseId={course.id} />
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center gap-x-2 mb-4">
                                    <IconBadge icon={ListChecks} />
                                    <h2 className="text-lg">Miscellaneous</h2>
                                </div>
                                <MiscellenousForm initialData={course} courseId={course.id} />
                            </div>
                        </div>
                    </div>
                )}

                {activeStep === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-x-2 mb-6">
                            <IconBadge icon={Timer} />
                            <h2 className="text-xl font-medium">Timetable</h2>
                        </div>
                        <TimeTableList initialData={course} courseId={course.id} />
                    </div>
                )}

            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between items-center pt-6 border-t mt-8">
                <Button
                    onClick={handlePrev}
                    disabled={activeStep === 1}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                </Button>

                <Button
                    onClick={handleNext}
                    disabled={
                        activeStep === steps.length ||
                        (activeStep === 1 && !isStep1Complete) ||
                        (activeStep === 2 && !isStep2Complete) ||
                        (activeStep === 3 && !isStep3Complete)
                    }
                    className="flex items-center gap-2"
                >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default CourseEditWizard;
