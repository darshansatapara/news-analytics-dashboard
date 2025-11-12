"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPageInfo = true,
}) {
  const getPageNumbers = () => {
    const pages = [];
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const showPages = isMobile ? 3 : 5; // Show fewer pages on mobile

    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    // Add first page with ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page with ellipsis if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
      {/* Page Info - Mobile: Top, Desktop: Left */}
      {showPageInfo && (
        <div className="text-xs sm:text-sm text-gray-400 order-1 sm:order-none">
          Page <span className="font-semibold text-white">{currentPage}</span>{" "}
          of <span className="font-semibold text-white">{totalPages}</span>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-2 order-2 sm:order-none">
        {/* First Page Button - Desktop Only */}
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="hidden md:flex p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="First page"
          >
            <ChevronsLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}

        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">
            Prev
          </span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-2">
          {getPageNumbers().map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <div
                  key={`${page}-${index}`}
                  className="px-2 sm:px-3 py-2 flex items-center justify-center"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </div>
              );
            }

            const isActive = page === currentPage;

            return (
              <motion.button
                key={page}
                onClick={() => handlePageChange(page)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base
                  min-w-[36px] sm:min-w-[44px]
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 text-gray-400 hover:text-white"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-page"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{page}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">
            Next
          </span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </button>

        {/* Last Page Button - Desktop Only */}
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden md:flex p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Last page"
          >
            <ChevronsRight className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Jump to Page - Desktop Only */}
      <div className="hidden lg:flex items-center gap-2 order-3">
        <label
          htmlFor="page-jump"
          className="text-xs text-gray-400 whitespace-nowrap"
        >
          Go to:
        </label>
        <input
          id="page-jump"
          type="number"
          min="1"
          max={totalPages}
          defaultValue={currentPage}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= totalPages) {
                handlePageChange(value);
              }
            }
          }}
          className="w-16 px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>
    </div>
  );
}
