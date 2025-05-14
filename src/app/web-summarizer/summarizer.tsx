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

import { Button } from "@/components/base/button";
import { Label } from "@/components/base/fieldset";
import { Select } from "@/components/base/select";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { useCredits } from "@/hooks/credits";
import { supportedLanguageModels, defaultLanguageModel } from "@/lib/models";
import { useCompletion } from "@ai-sdk/react";
import * as Headless from "@headlessui/react";
import { StopCircleIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AnimatedSparkleIcon from "../../components/animated-sparkle";
import CreditFooter from "../../components/credit-footer";

interface SummarizerPageProps {
  defaultModel?: string;
}

export default function SummarizerPage({ defaultModel }: SummarizerPageProps) {
  const [model, setModel] = useState<string>(defaultModel || defaultLanguageModel);
  const { deduct } = useCredits();
  const {
    isLoading,
    completion,
    input,
    handleInputChange,
    handleSubmit,
    error,
  } = useCompletion({
    api: "/api/web-summarizer",
    headers: {
      "X-AI-Model": model,
    },
    // Throttle the completion and data updates to 50ms:
    experimental_throttle: 50,
  });

  useEffect(() => {
    if (error) {
      toast.error(`Failed to fetch AI response: ${error}`);
    }
  }, [error]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return deduct(1).then((success) => {
      if (success) {
        handleSubmit(e);
      }
    });
  };

  return (
    <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 dark:bg-gray-950 lg:flex-row">
      {/* Info Card*/}
      <div className="lg:w-3/8 relative flex min-w-[400px] grow flex-col justify-center overflow-hidden px-6 lg:pointer-events-none lg:inset-0 lg:z-40 lg:flex lg:px-0">
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-y-auto lg:overflow-x-hidden lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto w-full min-w-[350px] max-w-md md:min-w-[400px] lg:mx-0 lg:flex lg:w-96 lg:flex-col lg:before:flex-1 lg:before:pt-6">
            <div className="pb-10 sm:pb-20 sm:pt-32 lg:py-20 lg:pt-20">
              <div className="relative">
                {/* Intro */}
                <h1 className="text-slate mt-14 text-pretty text-4xl/tight font-light">
                  Web Summarizer{" "}
                  <span className="text-orange-500">for any URL</span>
                </h1>
                <p className="mt-4 text-sm/6 text-slate-700">
                  Summarize any web page in seconds with Web Summarizer, the
                  AI-powered tool that extracts the most important information
                  from any URL. Get clear, concise summaries for quick review
                  and understanding.
                </p>

                {/* Controls */}
                <div className="text-slate flex flex-col gap-6 text-pretty py-4 md:gap-4">
                  <Headless.Field className="justift-center flex items-baseline gap-6">
                    <Label className="grow text-sm font-semibold">
                      Model
                    </Label>
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

                {/* URL */}
                <form
                  className="relative isolate mt-4 flex items-center pr-1 text-sm"
                  onSubmit={onSubmit}
                >
                  <label className="sr-only">URL</label>
                  <input
                    required
                    type="text"
                    autoFocus={true}
                    name="prompt"
                    value={input}
                    placeholder="Enter url here..."
                    className="peer w-0 flex-auto cursor-text bg-transparent px-4 py-2.5 text-base text-slate-800 placeholder:text-zinc-400 focus:outline-hidden disabled:text-gray-500 lg:text-sm"
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="my-1 max-h-10 text-sm"
                    disabled={isLoading}
                  >
                    <AnimatedSparkleIcon className="h-3 w-3 fill-orange-400" />
                    {isLoading ? "Summarizing..." : "Summarize"}
                  </Button>
                  <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-orange-300/15" />
                  <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 ring-orange-400/50 transition peer-focus:ring-orange-300" />
                </form>

                {isLoading && (
                  <div className="mt-5">
                    <Button
                      type="submit"
                      className="my-1 max-h-10 text-sm"
                      color="red"
                      onClick={() => stop()}
                    >
                      <StopCircleIcon className="h-3 w-3 animate-pulse text-white" />
                      Stop Summarization
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden flex-1 items-end pb-4 lg:block lg:justify-start lg:pb-6">
              <CreditFooter decorationColor="decoration-orange-300/[.66]" />
            </div>
          </div>
        </div>
      </div>

      {/* Summarization */}
      {completion && (
        <div className="no-scrollbar mt-14 max-h-screen w-full max-w-lg justify-start overflow-scroll border border-dashed pb-10 indent-8 text-base/8 font-light md:max-h-[850px] lg:max-w-xl">
          <div className="mx-auto w-full max-w-lg p-4">
            <MemoizedMarkdown id="web-summary" content={completion} />
          </div>
        </div>
      )}
    </div>
  );
}
