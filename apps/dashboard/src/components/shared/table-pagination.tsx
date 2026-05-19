'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface TablePaginationProps {
  page: number;
  totalPages: number;
  rangeLabel: string;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  rangeLabel,
  onPageChange,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{rangeLabel}</p>
      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="disabled:pointer-events-none disabled:opacity-50"
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="disabled:pointer-events-none disabled:opacity-50"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
