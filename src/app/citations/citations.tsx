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
import { useCredits } from "@/hooks/credits";
import { supportedLanguageModels } from "@/lib/models";
import { citationNeedsClassficationSchema } from "@/lib/schema";
import * as Headless from "@headlessui/react";
import { StopCircleIcon } from "@heroicons/react/20/solid";
import { experimental_useObject as useObject } from "ai/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AnimatedSparkleIcon from "../../components/animated-sparkle";
import CreditFooter from "../../components/credit-footer";
import CitationsTable from "./citations-table";

interface CitationsPageProps {
  q?: string;
  defaultModel?: string;
}

export default function CitationsPage({ q, defaultModel }: CitationsPageProps) {
  const [input, setInput] = useState(q);
  const [model, setModel] = useState<string>(defaultModel || "grok-3");
  const [classifications, setClassification] = useState<any>(null);
  const { deduct } = useCredits();
  const { object, submit, isLoading, stop, error } = useObject({
    api: "/api/ai-citation",
    schema: citationNeedsClassficationSchema,
    headers: {
      "X-AI-Model": model,
    },
  });

  useEffect(() => {
    if (object) {
      setClassification(object);
    }
  }, [object]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to fetch AI response: ${error}`);
    }
  }, [error]);

  const fetchClassification = async () => {
    if (!input) return;
    if (!(await deduct(1, input))) {
      return;
    }
    submit(input);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClassification(null);
    fetchClassification();
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
                  Citation Necessity{" "}
                  <span className="text-rose-500">for every sentence</span>
                </h1>
                <p className="mt-4 text-sm/6 text-slate-700">
                  Citation Necessity is an AI-driven tool for evaluating the
                  citation needs of written text. Input any passage, and it
                  categorizes each sentence based on whether it requires
                  evidence, enhancing academic and professional rigor.
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

                {/* Search Query */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative isolate mt-4 text-sm">
                    <label className="sr-only">Sentences</label>
                    <textarea
                      required
                      name="text"
                      autoFocus={true}
                      value={input}
                      placeholder="Enter your sentences here..."
                      className="peer w-full cursor-text bg-transparent px-4 py-2.5 text-base text-slate-800 placeholder:text-zinc-400 focus:outline-hidden disabled:text-gray-500 lg:text-sm"
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setInput(e.target.value)
                      }
                      rows={10}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-rose-300/15" />
                    <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 ring-rose-400/50 transition peer-focus:ring-rose-300" />
                  </div>

                  <div className="flex items-center">
                    <div className="grow"></div>
                    <Button
                      type="submit"
                      className="my-1 ml-auto max-h-10 text-sm"
                      disabled={isLoading}
                    >
                      <AnimatedSparkleIcon className="h-3 w-3 fill-rose-400" />
                      {isLoading ? "Examining..." : "Examine"}
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
                      Stop Examination
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden flex-1 items-end pb-4 lg:block lg:justify-start lg:pb-6">
              <CreditFooter decorationColor="decoration-rose-300/[.66]" />
            </div>
          </div>
        </div>
      </div>

      {/* Classifications Table */}
      {(isLoading || classifications) && (
        <CitationsTable
          className="stretch no-scrollbar lg:w-5/8 mx-auto max-h-screen w-full min-w-[350px] max-w-lg grow pb-10 md:min-w-[400px] lg:mx-6 lg:max-w-xl lg:pt-32"
          classifications={classifications}
        />
      )}
    </div>
  );
}
