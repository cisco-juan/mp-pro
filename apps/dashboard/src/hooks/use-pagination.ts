'use client';

import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 5;

interface UsePaginationOptions<T> {
  items: T[];
  pageSize?: number;
  resetKey?: string | number;
}

export function usePagination<T>({
  items,
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey,
}: UsePaginationOptions<T>) {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);
  const rangeLabel =
    totalItems === 0
      ? '0 resultados'
      : `${rangeStart}–${rangeEnd} de ${totalItems}`;

  return {
    page,
    setPage,
    paginatedItems,
    totalPages,
    totalItems,
    rangeLabel,
    pageSize,
  };
}
