// app/admin/users/_components/custom-pagination.tsx
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CustomDataTablePaginationProps {
  pagination: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  loading?: boolean;
}

export function CustomDataTablePagination({
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
}: CustomDataTablePaginationProps) {
  const { currentPage, totalPages, totalUsers, limit, hasNextPage, hasPreviousPage } = pagination;

  const handlePageSizeChange = (value: string) => {
    const newLimit = Number(value);
    onLimitChange?.(newLimit);
  };

  const handlePageChange = (page: number) => {
    if (loading) return;
    onPageChange?.(page);
  };

  // Calculate the range of users being displayed
  const startUser = (currentPage - 1) * limit + 1;
  const endUser = Math.min(currentPage * limit, totalUsers);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {startUser} to {endUser} of {totalUsers} users
        {loading && (
          <span className="ml-2 inline-flex items-center">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="ml-1">Loading...</span>
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${limit}`}
            onValueChange={handlePageSizeChange}
            disabled={loading}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={!hasPreviousPage || loading}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPreviousPage || loading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || loading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(totalPages)}
            disabled={!hasNextPage || loading}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}