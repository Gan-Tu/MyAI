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
//

"use client";

import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/base/description-list";
import { useSession } from "@/hooks/session";
import { type ResearchSession } from "@/lib/types";
import { ChevronLeftIcon, StopCircleIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ResearchPageProps {
  id: string;
}

export default function ResearchPage({ id }: ResearchPageProps) {
  const { user } = useSession();
  const [data, setData] = useState<ResearchSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleBack = () => {
    router.push("/research");
  };

  useEffect(() => {
    // TODO: refresh every 5 seconds
    if (user?.uid && !data && !error) {
      fetch(`/api/research/${id}`, {
        headers: { "X-User-Id": user?.uid || "" },
        cache: "no-store",
        next: { revalidate: 0 },
      }).then(async (res) => {
        if (!res.ok) {
          setError("Error loading research sessions");
        } else {
          setData(await res.json());
        }
      });
    }
  }, [user, data, error, id]);

  if (!data) {
    return (
      <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 lg:flex-row dark:bg-gray-950">
        <div className="flex w-full min-w-0 flex-col justify-center px-4 lg:w-1/2 lg:px-8">
          <div className="mx-auto w-full max-w-md">Loading</div>
        </div>
      </div>
    );
  }

  const {
    status,
    topic,
    model,
    current_step,
    sub_topic_index,
    research_plan,
    progress,
    final_report,
    error_message,
    created_at,
  } = data;

  if (error) {
    toast.error(`Error loading research: ${error}`);
    router.push("/404");
  }

  const handleCancel = async () => {
    await fetch(`/api/research/${id}/cancel`, {
      method: "POST",
      headers: { "X-User-Id": user?.uid || "" },
    });
    handleBack();
  };

  // Determine the next sub-topic if any remain
  const nextSubTopic =
    status === "pending" &&
    current_step === 1 &&
    research_plan &&
    sub_topic_index < research_plan.length
      ? research_plan[sub_topic_index]
      : null;

  return (
    <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 lg:flex-row dark:bg-gray-950">
      {/* Left Panel */}
      <div className="flex min-w-0 flex-col justify-center px-4 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mt-4 mb-4 flex items-center rounded-md bg-amber-500 py-2 pr-4 pl-2 text-sm text-white transition-colors hover:bg-amber-600"
          >
            <ChevronLeftIcon className="h-5 w-5 fill-white font-bold" />
            Back
          </button>
          <h1 className="text-slate mt-2 text-4xl/tight font-light text-pretty">
            Research Status
          </h1>
          <p className="mt-4 border p-4 text-sm/6 text-slate-700">{topic}</p>

          {/* Status and Progress */}
          <div className="mt-6">
            <DescriptionList className="grid grid-cols-3">
              <DescriptionTerm className="col-span-1">Model</DescriptionTerm>
              <DescriptionDetails className="">{model}</DescriptionDetails>

              <DescriptionTerm className="">Created at</DescriptionTerm>
              <DescriptionDetails className="">
                {new Date(created_at).toLocaleString()}
              </DescriptionDetails>

              <DescriptionTerm className="">Status</DescriptionTerm>
              <DescriptionDetails>
                <span
                  className={`font-semibold capitalize ${
                    status === "completed"
                      ? "text-green-500"
                      : status === "pending"
                        ? "text-amber-500"
                        : status === "canceled"
                          ? "text-red-500"
                          : "text-red-700"
                  }`}
                >
                  {status}
                </span>
              </DescriptionDetails>
            </DescriptionList>

            {status === "pending" && current_step === 0 && (
              <p className="mt-2 text-sm text-slate-600">
                Generating research plan...
              </p>
            )}

            {status === "pending" && current_step === 1 && research_plan && (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  Currently researching:{" "}
                  <span className="italic">
                    {research_plan[sub_topic_index]}
                  </span>
                </p>
                {nextSubTopic && (
                  <p className="mt-2 text-sm text-slate-600">
                    Next topic to research:{" "}
                    <span className="italic">{nextSubTopic}</span>
                  </p>
                )}
              </>
            )}
            {status === "pending" && current_step === 2 && (
              <p className="mt-2 text-sm text-slate-600">
                Compiling final report...
              </p>
            )}
            {status === "error" && (
              <p className="mt-2 text-sm text-red-500">
                Error: {error_message}
              </p>
            )}
          </div>

          {/* Cancel Button */}
          {status === "pending" && (
            <button
              className="mt-4 flex cursor-pointer items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600"
              color="red"
              onClick={handleCancel}
            >
              <StopCircleIcon className="mr-2 h-5 w-5 animate-pulse fill-white text-white" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Right Panel: Progress and Report */}
      <div className="flex min-w-0 flex-col items-center justify-center px-4 pt-8 lg:w-1/2 lg:px-8 lg:pt-0">
        <div className="relative mx-auto w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-sm md:max-h-[850px]">
          {/* Progress Updates */}
          {progress && progress.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                Progress Updates
              </h2>
              <div className="space-y-4">
                {progress.map((p: { message: string }, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-xs transition-colors hover:bg-gray-100"
                  >
                    <p className="text-sm break-words text-slate-700">
                      {p.message}
                    </p>
                    {/* Optional: Add clickable references or icons (e.g., for sub-topics or sources) */}
                    {i === 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <svg
                            className="h-3 w-3 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          20 sources
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Report */}
          {status === "completed" && final_report && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                Final Report
              </h2>
              <p className="prose prose-sm text-pretty text-slate-700">
                {final_report}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
