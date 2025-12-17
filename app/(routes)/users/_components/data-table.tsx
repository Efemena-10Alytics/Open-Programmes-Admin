// app/admin/users/_components/data-table.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomDataTablePagination } from "./custom-pagination";
import { DataTableToolbar } from "./toolbar";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  courses?: any[];
  cohorts?: any[];
  // Filter props
  onSearchChange?: (value: string) => void;
  onRoleFilterChange?: (values: string[]) => void;
  onCourseFilterChange?: (values: string[]) => void;
  onCohortFilterChange?: (values: string[]) => void;
  onClearFilters?: () => void;
  searchValue?: string;
  // Pagination props
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  courses = [],
  cohorts = [],
  onSearchChange,
  onRoleFilterChange,
  onCourseFilterChange,
  onCohortFilterChange,
  onClearFilters,
  searchValue = "",
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Disable built-in pagination since we're using server-side pagination
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar 
        table={table} 
        courses={courses} 
        cohorts={cohorts}
        onSearchChange={onSearchChange}
        onRoleFilterChange={onRoleFilterChange}
        onCourseFilterChange={onCourseFilterChange}
        onCohortFilterChange={onCohortFilterChange}
        onClearFilters={onClearFilters}
        searchValue={searchValue}
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && (
        <CustomDataTablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          loading={loading}
        />
      )}
    </div>
  );
}