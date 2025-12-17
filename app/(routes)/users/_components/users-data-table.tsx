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

interface UsersDataTableProps {
  courses: any[];
  cohorts: any[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function UsersDataTable({ courses, cohorts }: UsersDataTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0,
    limit: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [cohortFilter, setCohortFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchUsers = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (roleFilter) params.append("role", roleFilter);
      if (courseFilter) params.append("course", courseFilter);
      if (cohortFilter) params.append("cohort", cohortFilter);

      const response = await axiosInstance.get(`/api/users?${params.toString()}`);
      
      if (response.status === 200) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, roleFilter, courseFilter, cohortFilter, sortBy, sortOrder, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchUsers(1);
  }, [debouncedSearchQuery, roleFilter, courseFilter, cohortFilter, sortBy, sortOrder]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
  };

  // Handle limit changes
  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchUsers(1); // Reset to first page when changing limit
  };

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleRoleFilterChange = (value: string[]) => {
    setRoleFilter(value.length > 0 ? value[0] : ""); // For simplicity, taking first value
  };

  const handleCourseFilterChange = (value: string[]) => {
    setCourseFilter(value.length > 0 ? value[0] : "");
  };

  const handleCohortFilterChange = (value: string[]) => {
    setCohortFilter(value.length > 0 ? value[0] : "");
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setCourseFilter("");
    setCohortFilter("");
  };

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
        onSearchChange={handleSearchChange}
        onRoleFilterChange={handleRoleFilterChange}
        onCourseFilterChange={handleCourseFilterChange}
        onCohortFilterChange={handleCohortFilterChange}
        onClearFilters={clearAllFilters}
        searchValue={searchQuery}
        // Pagination props
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
      />
    </div>
  );
}

