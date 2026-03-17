// app/admin/users/_components/users-data-table.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { axiosInstance } from "@/utils/axios";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Loader2 } from "lucide-react";
import { useDebounce } from "@/app/hooks/use-debounce";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsersDataTableProps {
  users: User[];
  loading: boolean;
  pagination: PaginationInfo;
  courses: any[];
  cohorts: any[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (values: string[]) => void;
  onCourseFilterChange: (values: string[]) => void;
  onCohortFilterChange: (values: string[]) => void;
  onClearFilters: () => void;
  searchValue: string;
  refreshData?: () => void;
}

export function UsersDataTable({
  users,
  loading,
  pagination,
  courses,
  cohorts,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onRoleFilterChange,
  onCourseFilterChange,
  onCohortFilterChange,
  onClearFilters,
  searchValue,
  refreshData,
}: UsersDataTableProps) {
  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Custom toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Total: {pagination.totalUsers} users
          </div>
          <div className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
        </div>
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Data table with custom pagination */}
      <DataTable
        columns={columns}
        data={users}
        courses={courses}
        cohorts={cohorts}
        // Pass filter handlers
        onSearchChange={onSearchChange}
        onRoleFilterChange={onRoleFilterChange}
        onCourseFilterChange={onCourseFilterChange}
        onCohortFilterChange={onCohortFilterChange}
        onClearFilters={onClearFilters}
        searchValue={searchValue}
        // Pagination props
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        loading={loading}
        refreshData={refreshData}
      />
    </div>
  );
}

