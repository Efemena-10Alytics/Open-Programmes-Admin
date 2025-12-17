// app/admin/users/_components/toolbar.tsx
"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomFacetedFilter } from "./custom-faceted-filter";
import { UserCheck, BookOpen, Users } from "lucide-react";
import { useState, useEffect } from "react";

export const roles = [
  {
    value: "ADMIN",
    label: "Admin",
    icon: UserCheck,
  },
  {
    value: "COURSE_ADMIN",
    label: "Course Admin",
    icon: UserCheck,
  },
  {
    value: "USER",
    label: "User",
    icon: UserCheck,
  },
];

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  courses?: any[];
  cohorts?: any[];
  onSearchChange?: (value: string) => void;
  onRoleFilterChange?: (values: string[]) => void;
  onCourseFilterChange?: (values: string[]) => void;
  onCohortFilterChange?: (values: string[]) => void;
  onClearFilters?: () => void;
  searchValue?: string;
}

export function DataTableToolbar<TData>({
  table,
  courses = [],
  cohorts = [],
  onSearchChange,
  onRoleFilterChange,
  onCourseFilterChange,
  onCohortFilterChange,
  onClearFilters,
  searchValue = "",
}: DataTableToolbarProps<TData>) {
  // Track filter states to determine if "Reset" button should show
  const [hasRoleFilters, setHasRoleFilters] = useState(false);
  const [hasCourseFilters, setHasCourseFilters] = useState(false);
  const [hasCohortFilters, setHasCohortFilters] = useState(false);

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: course.title,
    icon: BookOpen,
  }));

  const cohortOptions = cohorts.map(cohort => ({
    value: cohort.id,
    label: cohort.name,
    icon: Users,
  }));

  // Check localStorage on mount to set initial filter states
  useEffect(() => {
    const checkStoredFilters = () => {
      try {
        const roleFilter = localStorage.getItem("user-role-filter");
        const courseFilter = localStorage.getItem("user-course-filter");
        const cohortFilter = localStorage.getItem("user-cohort-filter");

        setHasRoleFilters(roleFilter ? JSON.parse(roleFilter).length > 0 : false);
        setHasCourseFilters(courseFilter ? JSON.parse(courseFilter).length > 0 : false);
        setHasCohortFilters(cohortFilter ? JSON.parse(cohortFilter).length > 0 : false);
      } catch (error) {
        console.error("Error checking stored filters:", error);
      }
    };

    checkStoredFilters();
  }, []);

  const hasFilters = searchValue || 
    hasRoleFilters || 
    hasCourseFilters || 
    hasCohortFilters ||
    table.getState().columnFilters.some(filter => 
      filter.value && (Array.isArray(filter.value) ? filter.value.length > 0 : true)
    );

  const handleClearFilters = () => {
    // Clear table filters
    table.resetColumnFilters();
    
    // Clear localStorage filters
    try {
      localStorage.removeItem("user-role-filter");
      localStorage.removeItem("user-course-filter");
      localStorage.removeItem("user-cohort-filter");
    } catch (error) {
      console.error("Error clearing stored filters:", error);
    }

    // Reset local state
    setHasRoleFilters(false);
    setHasCourseFilters(false);
    setHasCohortFilters(false);

    // Call parent clear function
    onClearFilters?.();
  };

  const handleRoleFilterChange = (values: string[]) => {
    setHasRoleFilters(values.length > 0);
    onRoleFilterChange?.(values);
  };

  const handleCourseFilterChange = (values: string[]) => {
    setHasCourseFilters(values.length > 0);
    onCourseFilterChange?.(values);
  };

  const handleCohortFilterChange = (values: string[]) => {
    setHasCohortFilters(values.length > 0);
    onCohortFilterChange?.(values);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search users..."
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        <CustomFacetedFilter
          name="Roles"
          storageKey="user-role-filter"
          options={roles}
          onChange={handleRoleFilterChange}
        />
        
        {courseOptions.length > 0 && (
          <CustomFacetedFilter
            name="Courses"
            storageKey="user-course-filter"
            options={courseOptions}
            onChange={handleCourseFilterChange}
          />
        )}
        
        {cohortOptions.length > 0 && (
          <CustomFacetedFilter
            name="Cohorts"
            storageKey="user-cohort-filter"
            options={cohortOptions}
            onChange={handleCohortFilterChange}
          />
        )}
        
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}