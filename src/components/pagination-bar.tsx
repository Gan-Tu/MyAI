"use client";

import { Button } from "@/components/base/button";
import clsx from "clsx";

interface PaginationProps {
  page: number;
  resultsPerPage: number;
  totalResults: number;
  totalPages: number;
  handlePrevious: () => void;
  handleNext: () => void;
  className?: string;
}

export default function PaginationBar({
  page,
  resultsPerPage,
  totalResults,
  totalPages,
  handlePrevious,
  handleNext,
  className,
}: PaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className={clsx(
        "flex items-center justify-between gap-4 border-t border-gray-200 py-3",
        className,
      )}
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">{(page - 1) * resultsPerPage + 1}</span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(page * resultsPerPage, totalResults)}
          </span>{" "}
          of <span className="font-medium">{totalResults}</span> results
        </p>
      </div>
      <div className="flex flex-1 select-none justify-between sm:justify-end">
        <Button
          outline
          onClick={handlePrevious}
          disabled={page === 1}
          className={clsx(
            "relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-offset-0",
            { "cursor-not-allowed opacity-50": page === 1 },
          )}
        >
          Previous
        </Button>
        <Button
          outline
          onClick={handleNext}
          disabled={page === totalPages}
          className={clsx(
            "relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-offset-0",
            { "cursor-not-allowed opacity-50": page === totalPages },
          )}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
