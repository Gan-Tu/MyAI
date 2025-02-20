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
import { useCredits } from "@/hooks/credits";
import { useCompletion } from "@ai-sdk/react";
import { StopCircleIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AnimatedSparkleIcon from "../../components/animated-sparkle";
import CreditFooter from "../../components/credit-footer";

interface HighlighterPageProps {
  q?: string;
}

export default function HighlighterPage({ q }: HighlighterPageProps) {
  const { deduct } = useCredits();
  const {
    isLoading,
    completion,
    setCompletion,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    error,
  } = useCompletion({
    api: "/api/highlighter",
    // Throttle the completion and data updates to 50ms:
    experimental_throttle: 50,
  });
  const [calledApi, setCalledApi] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to fetch AI response: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (q) {
      setInput(q);
    }
  }, [setInput, q]);

  useEffect(() => {
    if (!input) {
      setInput("");
      setCalledApi(false);
      setCompletion("");
    }
  }, [setInput, setCompletion, setCalledApi, input]);

  useEffect(() => {
    if (!isLoading && calledApi && !completion) {
      toast.error("Nothing to highlight.");
    }
  }, [isLoading, calledApi, completion]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    return deduct(1).then((success) => {
      if (success) {
        setCalledApi(true);
        setCompletion("");
        handleSubmit(e);
      }
    });
  };

  const [beforeHighlight, afterHighlight] =
    input && completion && input.includes(completion)
      ? [
          input.slice(0, input.indexOf(completion)),
          input.slice(input.indexOf(completion) + completion.length),
        ]
      : [input || "", ""];

  return (
    <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 dark:bg-gray-950 lg:flex-row">
      {/* Info Card*/}
      <div className="lg:w-3/8 relative flex min-w-[400px] flex-grow flex-col justify-center overflow-hidden px-6 lg:pointer-events-none lg:inset-0 lg:z-40 lg:flex lg:px-0">
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-y-auto lg:overflow-x-hidden lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto w-full min-w-[350px] max-w-md md:min-w-[400px] lg:mx-0 lg:flex lg:w-96 lg:flex-col lg:before:flex-1 lg:before:pt-6">
            <div className="pb-10 sm:pb-20 sm:pt-32 lg:py-20 lg:pt-20">
              <div className="relative">
                {/* Intro */}
                <h1 className="text-slate mt-14 text-pretty text-4xl/tight font-light">
                  <span className="bg-amber-100">Text Highlighter</span>{" "}
                  <span className="text-amber-500">
                    for any piece of content.
                  </span>
                </h1>
                <p className="mt-4 text-sm/6 text-slate-700">
                  Pinpoint key information in any text with Text Highlighter,
                  the essential tool for marking important passages. Save your
                  highlighted sections for easy review and analysis.
                </p>

                {/* URL */}
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="relative isolate mt-4 text-sm">
                    <label className="sr-only">Text Snippet</label>
                    <textarea
                      required
                      name="prompt"
                      autoFocus={true}
                      value={input}
                      placeholder="Enter your text snippet here..."
                      className="peer w-full cursor-text bg-transparent px-4 py-2.5 text-base text-slate-800 placeholder:text-zinc-400 focus:outline-none disabled:text-gray-500 lg:text-sm"
                      onChange={handleInputChange}
                      rows={10}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-amber-300/15" />
                    <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 ring-amber-400/50 transition peer-focus:ring-amber-300" />
                  </div>

                  <div className="flex items-center">
                    <div className="flex-grow"></div>
                    <Button
                      type="submit"
                      className="my-1 ml-auto max-h-10 text-sm"
                      disabled={isLoading}
                    >
                      <AnimatedSparkleIcon className="h-3 w-3 fill-amber-400" />
                      {isLoading ? "Highlighting..." : "Highlight"}
                    </Button>
                  </div>
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
                      Stop Highlighting
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden flex-1 items-end pb-4 lg:block lg:justify-start lg:pb-6">
              <CreditFooter decorationColor="decoration-amber-300/[.66]" />
            </div>
          </div>
        </div>
      </div>

      {/* Highlighting */}
      {completion && !isLoading && (
        <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 pt-20 lg:min-h-full lg:px-8">
          <div className="no-scrollbar relative mx-auto w-full max-w-lg rounded-lg bg-white p-8 shadow-sm md:max-h-[850px]">
            <div className="prose prose-sm text-pretty text-lg/8 text-slate-700">
              {beforeHighlight}
              {input.includes(completion) && completion && (
                <span className="inline text-pretty bg-yellow-100 font-semibold">
                  {completion}
                </span>
              )}
              {afterHighlight}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
