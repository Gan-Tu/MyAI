"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { headers: { "user-id": "user123" } }).then((res) => res.json()); // Replace with actual auth

export default function Home() {
  const [topic, setTopic] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data, error } = useSWR("/api/research/deep", fetcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/research/new", {
        method: "POST",
        headers: { "Content-Type": "application/json", "user-id": "user123" }, // Replace with actual auth
        body: JSON.stringify({ topic }),
      });
      const { id } = await res.json();
      router.push(`/research/${id}`);
    } catch (error) {
      console.error("Error starting research:", error);
    } finally {
      setIsLoading(false);
      setTopic(""); // Clear input after submission
    }
  };

  return (
    <div className="font-display mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-4 lg:flex-row dark:bg-gray-950">
      {/* Left Panel: Form */}
      <div className="flex w-full min-w-0 flex-col justify-center px-4 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-slate mt-8 text-4xl/tight font-light text-pretty lg:mt-14">
            <span className="bg-pink-100">Deep Research</span>{" "}
            <span className="text-pink-500">for any topic.</span>
          </h1>
          <p className="mt-4 text-sm/6 text-slate-700">
            Explore any subject in depth or review your past research sessions
            below. Start a new research journey with ease.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative isolate text-sm">
              <label className="sr-only">Research Topic</label>
              <textarea
                required
                name="topic"
                autoFocus={true}
                value={topic}
                placeholder="Enter your research topic here..."
                className="peer w-full cursor-text resize-none border-none bg-transparent px-4 py-2.5 text-base text-slate-800 placeholder:text-zinc-400 focus:outline-none disabled:text-gray-500 lg:text-sm"
                onChange={(e) => setTopic(e.target.value)}
                rows={10}
                disabled={isLoading}
              />
              <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-pink-300/15" />
              <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 ring-pink-400/50 transition peer-focus:ring-pink-300" />
            </div>

            <div className="flex items-center">
              <div className="grow"></div>
              <button
                type="submit"
                className="my-1 ml-auto flex max-h-10 items-center justify-center rounded-md bg-pink-500 px-4 py-2 text-sm text-white transition-colors hover:bg-pink-600 disabled:bg-pink-300"
                disabled={isLoading}
              >
                <svg
                  className="mr-2 h-3 w-3 animate-pulse fill-pink-200"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {isLoading ? "Starting..." : "Start Research"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
            Powered by AI · Built with ❤️
          </p>
        </div>
      </div>

      {/* Right Panel: Session List */}
      <div className="flex w-full min-w-0 flex-col items-center justify-center px-4 pt-8 lg:w-1/2 lg:px-8 lg:pt-0">
        <div className="max-h-[600px] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-slate-800">
            Your Research Sessions
          </h2>
          {error && (
            <p className="mt-2 text-sm text-red-500">Error loading sessions</p>
          )}
          {!data && !error && (
            <p className="mt-2 text-sm text-slate-500">Loading...</p>
          )}
          {data && data.length === 0 && (
            <p className="mt-2 text-sm text-slate-600">
              No research sessions yet. Start one above!
            </p>
          )}
          {data && data.length > 0 && (
            <ul className="mt-4 space-y-3">
              {data.map((session: any) => (
                <li key={session.id} className="border-b border-slate-200 pb-2">
                  <Link
                    href={`/research/${session.id}`}
                    className="flex items-center justify-between text-sm text-slate-700 transition-colors hover:text-pink-500"
                  >
                    <span className="line-clamp-2">{session.topic}</span>
                    <span
                      className={`capitalize ${
                        session.status === "completed"
                          ? "text-green-500"
                          : session.status === "pending"
                            ? "text-pink-500"
                            : session.status === "canceled"
                              ? "text-red-500"
                              : "text-red-700"
                      }`}
                    >
                      {session.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
