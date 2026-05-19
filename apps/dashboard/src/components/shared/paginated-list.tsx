'use client';

import type { ReactNode } from 'react';
import { usePagination } from '@/hooks/use-pagination';
import { TablePagination } from '@/components/shared/table-pagination';

interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  resetKey?: string;
  className?: string;
}

export function PaginatedList<T>({
  items,
  renderItem,
  pageSize = 5,
  emptyMessage = 'Sin registros',
  resetKey,
  className = 'flex flex-col gap-2',
}: PaginatedListProps<T>) {
  const { paginatedItems, page, setPage, totalPages, rangeLabel } = usePagination({
    items,
    pageSize,
    resetKey,
  });

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={className}>
        {paginatedItems.map((item) => renderItem(item))}
      </div>
      {totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          rangeLabel={rangeLabel}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
