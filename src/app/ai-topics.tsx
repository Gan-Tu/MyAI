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
import { Switch, SwitchField } from "@/components/base/switch";
import { useColorTheme } from "@/hooks/color-theme";
import { useCredits } from "@/hooks/credits";
import { useResetExpansion } from "@/hooks/reset-expansion";
import { supportedLanguageModels } from "@/lib/models";
import { entityCardSchema } from "@/lib/schema";
import { ImageSearchResult } from "@/lib/types";
import * as Headless from "@headlessui/react";
import { MagnifyingGlassIcon, StopCircleIcon } from "@heroicons/react/20/solid";
import { experimental_useObject as useObject } from "ai/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AnimatedSparkleIcon from "../components/animated-sparkle";
import CreditFooter from "../components/credit-footer";
import AiCard from "./_components/ai-card";
import { getCachedAiTopics, searchImage } from "./actions";

interface AiTopicsProps {
  q?: string;
  defaultModel?: string;
}

const exampleIdeas = [
  "luigi mangione",
  "bench press",
  "last of us hbo",
  "squid game season 2",
  "sarenne black slope",
  "willow chip by google",
  "passion fruit martini",
  "frankfurt night ban",
];

export default function AiTopics({ q, defaultModel }: AiTopicsProps) {
  const [input, setInput] = useState(q);
  const [model, setModel] = useState<string>(defaultModel || "gpt-4o-mini");
  const [images, setImages] = useState<ImageSearchResult[] | null>(null);
  const [hideImage, setHideImage] = useState(false);
  const [useCache, setUseCache] = useState(true);
  const [card, setCard] = useState<any>(null);
  const { resetExpansion } = useResetExpansion();
  const { deduct } = useCredits();
  const { colorTheme, setColorTheme, allThemes } = useColorTheme();
  const { object, submit, isLoading, stop, error } = useObject({
    api: "/api/ai-topics",
    schema: entityCardSchema,
    headers: {
      "X-AI-Model": model,
    },
  });

  useEffect(() => {
    if (object) {
      setCard(object);
    }
  }, [object]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to fetch AI response: ${error}`);
    }
  }, [error]);

  const fetchTopicCard = async () => {
    if (!input) return;

    if (!(await deduct(1))) {
      return;
    }

    // Fetch Entity Card
    if (useCache) {
      const { data: cache, error } = await getCachedAiTopics(input, model);
      if (error) {
        console.error(error);
      } else if (cache) {
        setCard(cache);
        toast("Fetched AI response from redis cache");
        return;
      }
    }
    submit(input);

    // Fetch Images
    const { data, error } = await searchImage(input);
    if (error) {
      console.error(error);
      setImages([]);
      setHideImage(true);
    } else if (data) {
      setImages(data);
      setHideImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Restore default state
    setCard(null);
    resetExpansion();
    setImages(null);
    setHideImage(false);
    fetchTopicCard();
  };

  return (
    <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 dark:bg-gray-950 lg:flex-row">
      {/* Info Card*/}
      <div className="relative flex min-w-[400px] flex-grow flex-col justify-center overflow-hidden px-6 lg:pointer-events-none lg:inset-0 lg:z-40 lg:flex lg:w-1/2 lg:px-0">
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-y-auto lg:overflow-x-hidden lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto w-full min-w-[350px] max-w-md md:min-w-[400px] lg:mx-0 lg:flex lg:w-96 lg:flex-col lg:before:flex-1 lg:before:pt-6">
            <div className="pb-10 sm:pb-20 sm:pt-32 lg:py-20 lg:pt-20">
              <div className="relative">
                {/* Intro */}
                <h1 className="text-slate mt-14 text-pretty text-4xl/tight font-light">
                  AI Knowledge{" "}
                  <span className="text-blue-500">for every topic</span>
                </h1>
                <p className="mt-4 text-sm/6 text-slate-700">
                  AI Knowledge is your on-demand LLM-powered topic card
                  generator. Just ask a question, and it serves up a sleek,
                  concise card packed with a title, subtitle, description, key
                  facts, and even hero videos and images.
                </p>

                {/* Controls */}
                <div className="text-slate flex flex-col gap-6 text-pretty py-4 md:gap-4">
                  <SwitchField>
                    <Label className="flex-grow text-sm font-semibold">
                      Cache
                    </Label>
                    <Switch
                      defaultChecked
                      name="enable_cache"
                      onChange={setUseCache}
                      disabled={isLoading}
                      className="cursor-pointer"
                    />
                  </SwitchField>

                  <Headless.Field className="justift-center flex items-baseline gap-6">
                    <Label className="flex-grow text-sm font-semibold">
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

                  <Headless.Field className="justift-center flex items-baseline gap-6">
                    <Label className="flex-grow text-sm font-semibold">
                      Color Theme
                    </Label>
                    <Select
                      name="color_theme"
                      value={colorTheme}
                      onChange={(e) => setColorTheme(e.target.value)}
                      className="max-w-fit text-sm"
                      disabled={isLoading}
                    >
                      {allThemes.map((theme) => (
                        <option
                          key={theme}
                          value={theme}
                          className="text-end text-sm"
                        >
                          {theme}
                        </option>
                      ))}
                    </Select>
                  </Headless.Field>
                </div>

                {/* Search Query */}
                <form
                  className="relative isolate mt-4 flex items-center pr-1 text-sm"
                  onSubmit={handleSubmit}
                >
                  <label className="sr-only">Search Query</label>
                  <MagnifyingGlassIcon className="pointer-events-none ml-3 h-4 w-4 text-gray-500" />
                  <input
                    required
                    type="text"
                    autoFocus={true}
                    name="query"
                    value={input}
                    placeholder="Enter something here..."
                    className="peer w-0 flex-auto cursor-text bg-transparent px-4 py-2.5 text-base text-slate-800 placeholder:text-zinc-400 focus:outline-none disabled:text-gray-500 lg:text-sm"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInput(e.target.value)
                    }
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="my-1 max-h-10 text-sm"
                    disabled={isLoading}
                  >
                    <AnimatedSparkleIcon className="h-3 w-3 fill-sky-400" />
                    {isLoading ? "Loading..." : "Generate"}
                  </Button>
                  <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-sky-300/15" />
                  <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 transition peer-focus:ring-sky-300" />
                </form>

                {/* Ideas */}
                <p className="my-4 line-clamp-3 gap-4 text-pretty text-xs text-slate-500">
                  Need ideas? Try: {exampleIdeas.join(", ")}
                </p>

                {isLoading && (
                  <div className="mt-5">
                    <Button
                      type="submit"
                      className="my-1 max-h-10 text-sm"
                      color="red"
                      onClick={() => stop()}
                    >
                      <StopCircleIcon className="h-3 w-3 animate-pulse text-white" />
                      Stop Generation
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden flex-1 items-end pb-4 lg:block lg:justify-start lg:pb-6">
              <CreditFooter />
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Card */}
      {(isLoading || card) && (
        <AiCard
          className="stretch no-scrollbar mx-auto max-h-screen w-full min-w-[350px] max-w-md flex-grow pb-10 md:min-w-[400px] lg:mx-6 lg:w-1/2 lg:pt-32"
          card={card}
          hideHero={hideImage}
          images={images}
        />
      )}
    </div>
  );
}
