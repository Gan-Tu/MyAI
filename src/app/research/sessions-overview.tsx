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

import PaginationBar from "@/components/pagination-bar";
import { usePagination } from "@/hooks/pagination";
import { DeepResearchSessionStatus } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";

interface ResearchSessionProps {
  isLoading: boolean;
  sessions: DeepResearchSessionStatus[];
  error?: string | null;
}

export default function ResearchSessionsOverview({
  isLoading,
  sessions,
  error,
}: ResearchSessionProps) {
  const {
    page,
    totalPages,
    totalResults,
    resultsPerPage,
    filterResults,
    handleNext,
    handlePrevious,
  } = usePagination(sessions.length, 5);
  const currentSessions = filterResults(sessions);

  return (
    <div className="max-h-[600px] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xs">
      <h2 className="text-lg font-semibold text-slate-800">
        Research Sessions
      </h2>
      {error && (
        <p className="mt-2 text-sm text-red-500">
          Error loading sessions: {error}
        </p>
      )}
      {isLoading && <p className="mt-2 text-sm text-slate-500">Loading...</p>}
      {!isLoading && !sessions?.length && (
        <p className="mt-2 text-sm text-slate-600">
          No research sessions yet. Start one!
        </p>
      )}
      {!isLoading && sessions?.length > 0 && (
        <ul className="mt-4 space-y-3">
          {currentSessions?.map((session: DeepResearchSessionStatus) => (
            <li
              key={session.session_id}
              className="border-b border-slate-200 pb-2"
            >
              <Link
                href={
                  session.status === "completed"
                    ? `/research/${session.session_id}/report`
                    : `/research/${session.session_id}`
                }
                className="flex items-center justify-between text-sm text-slate-700 transition-colors hover:text-blue-500"
              >
                <span
                  className={clsx(
                    "line-clamp-2",
                    session.status === "canceled" && "line-through",
                  )}
                >
                  {session.topic}
                </span>
                <span
                  className={`ml-4 capitalize ${
                    session.status === "completed"
                      ? "text-green-500"
                      : session.status === "pending" ||
                          session.status == "in_progress"
                        ? "text-orange-500"
                        : session.status === "canceled"
                          ? "text-red-500"
                          : "text-red-700"
                  }`}
                >
                  {session.status.replace("_", " ")}
                </span>
              </Link>
              {session.model && (
                <span className="text-xs text-slate-400">
                  <b>{session.model}</b>, Created at{" "}
                  {new Date(session.created_at).toLocaleString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {sessions?.length > 0 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          resultsPerPage={resultsPerPage}
          totalResults={totalResults}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
        />
      )}
    </div>
  );
}
