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

import AnimatedSparkleIcon from "@/components/animated-sparkle";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/fieldset";
import { Select } from "@/components/base/select";
import CreditFooter from "@/components/credit-footer";
import { useCredits } from "@/hooks/credits";
import { useSession } from "@/hooks/session";
import { supportedLanguageModels } from "@/lib/models";
import * as Headless from "@headlessui/react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ResearchHomeProps {
  q?: string;
  defaultModel?: string;
}

export default function ResearchHome({ q, defaultModel }: ResearchHomeProps) {
  const [topic, setTopic] = useState(q);
  const [model, setModel] = useState<string>(defaultModel || "grok-2-1212");
  const { deduct } = useCredits();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSession();
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid && !data && !error) {
      fetch("/api/research/status", {
        headers: { "X-User-Id": user?.uid || "" },
      }).then(async (res) => {
        if (!res.ok) {
          toast.error("Error loading research sessions");
        } else {
          setData(await res.json());
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await deduct(0, topic))) {
      // reset to 25
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/research/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user?.uid || "",
          "X-AI-Model": model,
        },
        body: JSON.stringify({ topic }),
      });
      const { id } = await res.json();
      router.push(`/research/${id}`);
    } catch (error) {
      toast.error(`Error starting research: ${error}`);
    } finally {
      setIsLoading(false);
      setTopic("");
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

          {/* Controls */}
          <div className="text-slate flex flex-col gap-6 py-4 text-pretty md:gap-4">
            <Headless.Field className="justift-center flex items-baseline gap-6">
              <Label className="grow text-sm font-semibold">Model</Label>
              <Select
                name="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="max-w-fit text-sm"
                disabled={isLoading}
              >
                {supportedLanguageModels.map((model) => (
                  <option
                    key={model}
                    value={model}
                    className="text-end text-sm"
                  >
                    {model}
                  </option>
                ))}
              </Select>
            </Headless.Field>
          </div>

          {/* Search Query */}
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

            <div className="flex flex-col items-end">
              <Button
                type="submit"
                className="my-1 ml-auto max-h-10 text-sm"
                disabled={isLoading}
              >
                <AnimatedSparkleIcon className="h-3 w-3 fill-pink-400" />
                {isLoading ? "Researching..." : "Research"}
                <span className="text-xs font-light">(20 Credits)</span>
              </Button>
            </div>
          </form>

          <div className="hidden flex-1 items-end pb-4 lg:block lg:justify-start lg:pb-6">
            <CreditFooter decorationColor="decoration-pink-300/[.66]" />
          </div>
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
              No research sessions yet. Start one!
            </p>
          )}
          {data && data.length > 0 && (
            <ul className="mt-4 space-y-3">
              {/* TODO: add pagination */}
              {data.map((session: any) => (
                <li key={session.id} className="border-b border-slate-200 pb-2">
                  <Link
                    href={`/research/${session.id}`}
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
        </div>
      </div>
    </div>
  );
}
