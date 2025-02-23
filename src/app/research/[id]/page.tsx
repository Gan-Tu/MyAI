"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { headers: { "user-id": "user123" } }).then((res) => res.json()); // Replace with actual auth

export default function ResearchPage({ params }: { params: { id: string } }) {
  const { data, error } = useSWR(`/api/research/${params.id}`, fetcher, {
    refreshInterval: 5000, // Poll every 5 seconds
  });
  const router = useRouter();

  if (error)
    return (
      <div className="text-center text-red-500">
        Error loading research session
      </div>
    );
  if (!data)
    return <div className="text-center text-slate-500">Loading...</div>;

  const {
    status,
    topic,
    current_step,
    sub_topic_index,
    research_plan,
    progress,
    final_report,
    error_message,
  } = data;

  const handleCancel = async () => {
    await fetch(`/api/research/${params.id}/cancel`, {
      method: "POST",
      headers: { "user-id": "user123" }, // Replace with actual auth
    });
    router.refresh();
  };

  // Determine the next sub-topic if any remain
  const nextSubTopic =
    status === "pending" &&
    current_step === 1 &&
    research_plan &&
    sub_topic_index < research_plan.length
      ? research_plan[sub_topic_index]
      : null;

  const handleBack = () => {
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
            className="mt-4 mb-4 flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm text-white transition-colors hover:bg-amber-600"
          >
            <svg
              className="mr-2 h-3 w-3 fill-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            Back
          </button>

          <h1 className="text-slate mt-2 text-4xl/tight font-light text-pretty">
            <span className="bg-amber-100">Researching</span>{" "}
            <span className="text-amber-500">{topic}</span>
          </h1>
          <p className="mt-4 text-sm/6 text-slate-700">
            Follow the progress of your deep research session below. Cancel
            anytime if needed.
          </p>

          {/* Status and Progress */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-800">
              Status:{" "}
              <span className="text-amber-500 capitalize">{status}</span>
            </p>
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
            {status === "canceled" && (
              <p className="mt-2 text-sm text-red-500">Research canceled</p>
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
              onClick={handleCancel}
              className="mt-4 flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
            >
              <svg
                className="mr-2 h-3 w-3 animate-pulse fill-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" />
                <rect x="11" y="6" width="2" height="12" />
                <rect x="6" y="11" width="12" height="2" />
              </svg>
              Cancel Research
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
