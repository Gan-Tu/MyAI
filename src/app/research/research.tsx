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
import { type DeepResearchSessionStatus } from "@/lib/types";
import * as Headless from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { listSessions, startSession } from "./actions";
import ResearchSessionsOverview from "./sessions-overview";

interface ResearchHomeProps {
  q?: string;
  defaultModel?: string;
}

export default function ResearchHome({ q, defaultModel }: ResearchHomeProps) {
  const [topic, setTopic] = useState<string>(q || "");
  const [model, setModel] = useState<string>(defaultModel || "grok-2-1212");
  const { deduct } = useCredits();
  const { user } = useSession();
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessions, setSessions] = useState<DeepResearchSessionStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      listSessions(user.uid)
        .then(async (res) => {
          setSessions(res);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoadingSessions(false);
        });
    }
  }, [user, setIsLoadingSessions, setError, isLoadingSessions]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await deduct(25, topic))) {
      return;
    }
    setIsStarting(true);
    try {
      let userId = user?.uid;
      if (!userId) {
        throw new Error("User ID not found");
      }
      const session_id = await startSession(userId, topic, model);
      router.push(`/research/${session_id}`);
    } catch (error) {
      toast.error(`Error starting research: ${error}`);
    } finally {
      setIsStarting(false);
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
                disabled={isStarting}
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
                disabled={isStarting}
              />
              <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-pink-300/15" />
              <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 ring-pink-400/50 transition peer-focus:ring-pink-300" />
            </div>

            <div className="flex flex-col items-end">
              <Button
                type="submit"
                className="my-1 ml-auto max-h-10 text-sm"
                disabled={isStarting}
              >
                <AnimatedSparkleIcon className="h-3 w-3 fill-pink-400" />
                {isStarting ? "Researching..." : "Research"}
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
        <ResearchSessionsOverview
          isLoading={isLoadingSessions}
          sessions={sessions || []}
          error={error}
        />
      </div>
    </div>
  );
}
