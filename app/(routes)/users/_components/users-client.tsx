"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { AddUserModal } from "@/components/modals/add-user-modal";
import { BulkImportUserModal } from "@/components/modals/bulk-import-user-modal";
import { UpdateCommunityLinkModal } from "@/components/modals/community-link-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UsersDataTable } from "./users-data-table";
import { User } from "@/types";
import { axiosInstance } from "@/utils/axios";
import { useDebounce } from "@/app/hooks/use-debounce";

interface UsersClientProps {
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

export const UsersClient = ({ courses, cohorts }: UsersClientProps) => {
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search query
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

  const refreshData = () => fetchUsers(pagination.currentPage);

  return (
    <div className="py-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Users"
          description={`Manage users (${pagination.totalUsers} total)`}
        />
        <div className="flex items-center space-x-2">
          <Link href="/payments">
            <Button variant="outline">
              View Payments
            </Button>
          </Link>
          <AddUserModal 
            courses={courses} 
            cohorts={cohorts} 
            onSuccess={refreshData}
          />
          <BulkImportUserModal 
            courses={courses} 
            cohorts={cohorts} 
            onSuccess={refreshData}
          />
          <UpdateCommunityLinkModal />
        </div>
      </div>
      <Separator className="my-5" />
      <UsersDataTable 
        users={users}
        loading={loading}
        pagination={pagination}
        courses={courses}
        cohorts={cohorts}
        onPageChange={fetchUsers}
        onLimitChange={(limit) => {
            setPagination(prev => ({ ...prev, limit }));
            fetchUsers(1);
        }}
        onSearchChange={setSearchQuery}
        onRoleFilterChange={(roles) => setRoleFilter(roles[0] || "")}
        onCourseFilterChange={(courses) => setCourseFilter(courses[0] || "")}
        onCohortFilterChange={(cohorts) => setCohortFilter(cohorts[0] || "")}
        onClearFilters={() => {
            setSearchQuery("");
            setRoleFilter("");
            setCourseFilter("");
            setCohortFilter("");
        }}
        searchValue={searchQuery}
        refreshData={refreshData}
      />
    </div>
  );
};
