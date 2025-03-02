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
import { type DeepResearchSession } from "@/lib/types";
import {
  ChevronLeftIcon,
  StopCircleIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ResearchPageProps {
  id: string;
}

export default function ResearchPage({ id }: ResearchPageProps) {
  const [data, setData] = useState<DeepResearchSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleBack = () => {
    router.push("/research");
  };

  const fetchData = useCallback(() => {
    setIsLoading(true);
    fetch(`/api/research/${id}`, { cache: "no-store", next: { revalidate: 0 } })
      .then(async (res) => {
        if (!res.ok) {
          setError("Error loading research sessions");
        } else {
          setData(await res.json());
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fetch, setIsLoading, id]);

  useEffect(() => {
    // TODO: refresh every 5 seconds
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      console.error(error);
    }
  }, [error]);

  if (!data) {
    if (isLoading) {
      return (
        <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 lg:flex-row dark:bg-gray-950">
          <div className="flex w-full min-w-0 flex-col justify-center px-4 lg:w-1/2 lg:px-8">
            <div className="mx-auto w-full max-w-md">Loading</div>
          </div>
        </div>
      );
    }
    router.push("/404");
    return null;
  }

  const handleCancel = async () => {
    await fetch(`/api/research/${id}/cancel`, { method: "POST" });
    router.refresh();
    fetchData();
  };

  const handleDelete = async () => {
    await fetch(`/api/research/${id}`, { method: "DELETE" });
    router.push("/research");
  };

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
          <p className="mt-4 border p-4 text-sm/6 text-slate-700">
            {data.topic}
          </p>

          {/* Status and Progress */}
          <div className="mt-6">
            <DescriptionList className="grid grid-cols-3">
              <DescriptionTerm className="col-span-1">Model</DescriptionTerm>
              <DescriptionDetails className="">{data.model}</DescriptionDetails>

              <DescriptionTerm className="">Created at</DescriptionTerm>
              <DescriptionDetails className="">
                {new Date(data.created_at).toLocaleString()}
              </DescriptionDetails>

              <DescriptionTerm className="">Status</DescriptionTerm>
              <DescriptionDetails>
                <span
                  className={`font-semibold capitalize ${
                    data.status === "completed"
                      ? "text-green-500"
                      : data.status === "pending"
                        ? "text-amber-500"
                        : data.status === "canceled"
                          ? "text-red-500"
                          : "text-red-700"
                  }`}
                >
                  {data.status}
                </span>
              </DescriptionDetails>
            </DescriptionList>
            {/* 
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
            )} */}
          </div>

          {/* Cancel Button */}
          {["pending", "in_progress"].includes(data.status) && (
            <button
              className="mt-4 flex cursor-pointer items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600"
              color="red"
              onClick={handleCancel}
            >
              <StopCircleIcon className="mr-2 h-5 w-5 animate-pulse fill-white text-white" />
              Cancel
            </button>
          )}

          {/* Delete Button */}
          {!["pending", "in_progress"].includes(data.status) && (
            <button
              className="mt-4 flex cursor-pointer items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
              color="red"
              onClick={handleDelete}
            >
              <TrashIcon className="mr-2 h-5 w-5 fill-white text-white" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Right Panel: Progress and Report */}
      <div className="flex min-w-0 flex-col items-center justify-center px-4 pt-8 lg:w-1/2 lg:px-8 lg:pt-0">
        <div className="relative mx-auto w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-sm md:max-h-[850px]">
          {/* // TODO */}
        </div>
      </div>
    </div>
  );
}
