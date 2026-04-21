"use client";
import { useState } from "react";

interface PaginationInfoType {
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const usePagination = ({
  defaultPageSize = 10,
  defaultPage = 1,
}: {
  defaultPageSize?: number;
  defaultPage?: number;
} = {}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfoType>({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const handlePageChange = (newPage: number) => {
    const maxPage = Math.max(1, paginationInfo.totalPages);
    if (newPage >= 1 && newPage <= maxPage) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: string | number | null) => {
    if (newPageSize === null) return;
    const size = typeof newPageSize === "string" ? parseInt(newPageSize, 10) : newPageSize;
    setPageSize(size);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const total = Math.max(1, paginationInfo.totalPages);
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(total, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const updatePaginationInfo = (info: Partial<PaginationInfoType>) => {
    setPaginationInfo((prev) => ({ ...prev, ...info }));
  };

  return {
    currentPage,
    pageSize,
    paginationInfo,
    handlePageChange,
    handlePageSizeChange,
    getPageNumbers,
    updatePaginationInfo,
    setCurrentPage,
  };
};
