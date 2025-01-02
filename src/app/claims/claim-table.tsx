// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/base/table";
import CreditFooter from "@/components/credit-footer";
import PaginationBar from "@/components/pagination-bar";
import { usePagination } from "@/hooks/pagination";
import { claimsSchemaType } from "@/lib/types";
import clsx from "clsx";

interface ClaimsTableProps {
  claims: Partial<claimsSchemaType>;
  className?: string;
}

export default function ClaimsTable({ claims, className }: ClaimsTableProps) {
  const {
    page,
    totalPages,
    resultsPerPage,
    filterResults,
    handleNext,
    handlePrevious,
  } = usePagination(claims?.facts?.length || 0, 10);
  const currentFacts = filterResults(claims?.facts);
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
                Claim #{(page - 1) * resultsPerPage + index + 1}
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

      {claims?.facts?.length > 0 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          resultsPerPage={resultsPerPage}
          totalResults={claims?.facts?.length}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
        />
      )}

      <CreditFooter
        className="mt-4 justify-end bg-transparent lg:hidden"
        decorationColor="decoration-green-300/[.66]"
      />
    </div>
  );
}
