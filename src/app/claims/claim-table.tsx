"use client";

import { Button } from "@/components/base/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/base/table";
import CreditFooter from "@/components/credit-footer";
import { claimsSchemaType } from "@/lib/types";
import clsx from "clsx";
import { useState } from "react";

interface ClaimsTableProps {
  claims: Partial<claimsSchemaType>;
  className?: string;
}

export default function ClaimsTable({ claims, className }: ClaimsTableProps) {
  const [page, setPage] = useState(1);
  const factsPerPage = 10;
  const totalResults = claims?.facts?.length || 0;
  const totalPages = Math.ceil(totalResults / factsPerPage);

  // Get the current page's facts
  const currentFacts = claims?.facts?.slice(
    (page - 1) * factsPerPage,
    page * factsPerPage,
  );

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div
      className={clsx(
        className,
        "flex flex-col content-center justify-center overflow-scroll",
      )}
    >
      <Table className="no-scrollbar px-5" dense>
        <TableHead>
          <TableRow>
            <TableHeader>Claim #</TableHeader>
            <TableHeader>Factoid</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentFacts?.map((fact: string, index: number) => (
            <TableRow key={`fact-${index}`}>
              <TableCell className="mx-4 font-medium">
                Claim #{(page - 1) * factsPerPage + index + 1}
              </TableCell>
              <TableCell className="text-pretty font-normal">{fact}</TableCell>
            </TableRow>
          ))}
          {!currentFacts?.length && (
            <TableRow>
              <TableCell className="text-pretty font-normal">
                No claims found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {currentFacts?.length > 0 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(page - 1) * factsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(page * factsPerPage, totalResults)}
              </span>{" "}
              of <span className="font-medium">{totalResults}</span> results
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end">
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
      )}
      <CreditFooter
        className="mt-4 justify-end bg-transparent lg:hidden"
        decorationColor="decoration-green-300/[.66]"
      />
    </div>
  );
}
