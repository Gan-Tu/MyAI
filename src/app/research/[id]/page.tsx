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

  return (
    <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 lg:flex-row dark:bg-gray-950">
      {/* Left Panel */}
      <div className="relative flex min-w-[400px] grow flex-col justify-center overflow-hidden px-6 lg:pointer-events-none lg:inset-0 lg:z-40 lg:flex lg:w-3/8 lg:px-0">
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-x-hidden lg:overflow-y-auto lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto w-full max-w-md min-w-[350px] md:min-w-[400px] lg:mx-0 lg:flex lg:w-96 lg:flex-col lg:before:flex-1 lg:before:pt-6">
            <div className="pb-10 sm:pt-32 sm:pb-20 lg:py-20 lg:pt-20">
              <div className="relative">
                <h1 className="text-slate mt-14 text-4xl/tight font-light text-pretty">
                  <span className="bg-pink-100">Researching</span>{" "}
                  <span className="text-pink-500">{topic}</span>
                </h1>
                <p className="mt-4 text-sm/6 text-slate-700">
                  Follow the progress of your deep research session below.
                  Cancel anytime if needed.
                </p>

                {/* Status and Progress */}
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-800">
                    Status:{" "}
                    <span className="text-pink-500 capitalize">{status}</span>
                  </p>
                  {status === "pending" && current_step === 0 && (
                    <p className="mt-2 text-sm text-slate-600">
                      Generating research plan...
                    </p>
                  )}
                  {status === "pending" &&
                    current_step === 1 &&
                    research_plan && (
                      <p className="mt-2 text-sm text-slate-600">
                        Researching sub-topic {sub_topic_index + 1} of{" "}
                        {research_plan.length}:{" "}
                        <span className="italic">
                          {research_plan[sub_topic_index]}
                        </span>
                      </p>
                    )}
                  {status === "pending" && current_step === 2 && (
                    <p className="mt-2 text-sm text-slate-600">
                      Compiling final report...
                    </p>
                  )}
                  {status === "canceled" && (
                    <p className="mt-2 text-sm text-red-500">
                      Research canceled
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
          </div>
        </div>
      </div>

      {/* Right Panel: Progress and Report */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 pt-20 lg:min-h-full lg:px-8">
        <div className="no-scrollbar relative mx-auto w-full max-w-lg overflow-y-auto rounded-lg bg-white p-8 shadow-xs md:max-h-[850px]">
          {progress && progress.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Progress Updates
              </h2>
              <ul className="mt-2 space-y-2">
                {progress.map((p: { message: string }, i: number) => (
                  <li key={i} className="text-sm break-words text-slate-700">
                    {p.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {status === "completed" && final_report && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Final Report
              </h2>
              <p className="prose prose-sm mt-2 text-pretty text-slate-700">
                {final_report}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
