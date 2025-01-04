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

import { Badge } from "@/components/base/badge";
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
import { citationNeedsClassficationSchemaType } from "@/lib/types";
import clsx from "clsx";

interface CitationsTableProps {
  classifications: Partial<citationNeedsClassficationSchemaType>;
  className?: string;
}

function getBadgeColor(verdict: string) {
  if (verdict === "Citation Unhelpful") {
    return "zinc";
  }
  if (verdict === "Citation Neutral") {
    return "sky";
  }
  if (verdict === "Citation Slightly") {
    return "fuchsia";
  }
  if (verdict === "Citation Preferred") {
    return "amber";
  }
  if (verdict === "Citation Required") {
    return "red";
  }
  return "lime";
}

export default function CitationsTable({
  classifications,
  className,
}: CitationsTableProps) {
  const {
    page,
    totalPages,
    resultsPerPage,
    filterResults,
    handleNext,
    handlePrevious,
  } = usePagination(classifications?.classifications?.length || 0, 4);
  const currentClassifications = filterResults(
    classifications?.classifications,
  );
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
            <TableHeader>Sentence</TableHeader>
            <TableHeader>Citation Needs</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentClassifications?.map((classification, index: number) => (
            <TableRow key={`classification-${index}`}>
              <TableCell className="min-w-sm max-w-sm text-pretty font-normal italic">
                {classification.sentence}
              </TableCell>
              <TableCell className="text-pretty font-normal">
                <Badge color={getBadgeColor(classification.verdict)}>
                  {classification.verdict}
                </Badge>
                <div className="mt-2">{classification.reason}</div>
              </TableCell>
            </TableRow>
          ))}
          {!currentClassifications?.length && (
            <TableRow>
              <TableCell className="text-pretty font-normal">
                No classifications found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {classifications?.classifications?.length > 0 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          resultsPerPage={resultsPerPage}
          totalResults={classifications?.classifications?.length}
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
