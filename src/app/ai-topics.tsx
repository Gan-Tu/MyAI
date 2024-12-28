"use client";

import { Button } from "@/components/base/button";
import { Label } from "@/components/base/fieldset";
import { Select } from "@/components/base/select";
import { Switch, SwitchField } from "@/components/base/switch";
import { useResetExpansion } from "@/hooks/reset-expansion";
import { supportedModels } from "@/lib/models";
import { entityCardSchema } from "@/lib/schema";
import { ImageSearchResult } from "@/lib/types";
import { capElements } from "@/lib/utils";
import * as Headless from "@headlessui/react";
import { MagnifyingGlassIcon, StopCircleIcon } from "@heroicons/react/20/solid";
import { experimental_useObject as useObject } from "ai/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Description from "./_components/description";
import FactsList from "./_components/fact-list";
import Header from "./_components/header";
import HeroCarousel from "./_components/hero-carousel";
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

function SparkleIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <path
        fill="#38BDF8"
        d="M5.338 9.805c.11.418.439.747.857.857C7.282 10.948 8 11.44 8 12s-.718 1.052-1.805 1.338c-.418.11-.747.439-.857.857C5.052 15.281 4.56 16 4 16s-1.052-.718-1.338-1.805a1.205 1.205 0 0 0-.856-.857C.718 13.052 0 12.56 0 12s.718-1.052 1.806-1.338c.417-.11.746-.439.856-.857C2.948 8.718 3.441 8 4 8c.56 0 1.052.718 1.338 1.805Z"
      />
      <path
        fill="#7DD3FC"
        d="M12.717 2.432c.1.42.43.75.85.852C15.026 3.633 16 4.27 16 5s-.975 1.367-2.432 1.716c-.42.101-.75.432-.851.852C12.367 9.025 11.729 10 11 10c-.729 0-1.367-.975-1.716-2.432-.101-.42-.431-.75-.851-.852C6.975 6.367 6 5.73 6 5c0-.73.975-1.367 2.433-1.717.42-.1.75-.43.85-.85C9.634.974 10.272 0 11 0c.73 0 1.367.975 1.717 2.432Z"
      />
    </svg>
  );
}

export default function AiTopics({ q, defaultModel }: AiTopicsProps) {
  const [input, setInput] = useState(q);
  const [model, setModel] = useState<string>(defaultModel || "gpt-4o-mini");
  const [images, setImages] = useState<ImageSearchResult[] | null>(null);
  const [hideImage, setHideImage] = useState(false);
  const [useCache, setUseCache] = useState(true);
  const [card, setCard] = useState<any>(null);
  const { resetExpansion } = useResetExpansion();
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

  const fetchImages = async () => {
    if (input) {
      const { data, error } = await searchImage(input);
      if (error) {
        console.error(error);
        setImages([]);
        setHideImage(true);
      } else if (data) {
        setImages(data);
        setHideImage(false);
      }
    }
  };

  const fetchEntityCard = async () => {
    if (!input) return;
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
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCard(null);
    resetExpansion();
    setImages(null);
    setHideImage(false);
    fetchEntityCard();
    fetchImages();
  };

  return (
    <div className="font-display flex min-h-full flex-col dark:bg-gray-950 lg:flex-row">
      {/* Info Card*/}
      <div className="relative min-w-[400px] overflow-hidden px-6 lg:pointer-events-none lg:inset-0 lg:z-40 lg:flex lg:px-0">
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-y-auto lg:overflow-x-hidden lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto w-full min-w-[350px] max-w-md md:min-w-[400px] lg:mx-0 lg:flex lg:w-96 lg:flex-col lg:before:flex-1 lg:before:pt-6">
            <div className="pb-10 sm:pb-20 sm:pt-32 lg:py-20 lg:pt-20">
              <div className="relative">
                {/* Intro */}
                <h1 className="text-slate mt-14 text-pretty text-4xl/tight font-light">
                  AI Knowledge{" "}
                  <span className="text-sky-500">for every topic</span>
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
                      {supportedModels.map((model) => (
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
                    <SparkleIcon className="h-3 w-3" />
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
              <p className="flex items-baseline gap-x-2 text-[0.8125rem]/6 text-gray-500">
                Brought to you by Gan Tu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Card */}
      <div className="stretch no-scrollbar mx-auto mr-10 max-h-screen w-full min-w-[350px] max-w-md flex-col overflow-scroll pb-10 sm:pb-20 sm:pt-32 md:min-w-[400px] lg:pt-52">
        <div className="my-auto rounded-2xl bg-white">
          <div className="max-w-xl rounded-lg bg-white shadow-lg">
            <Header title={card?.title} subtitle={card?.subtitle} />
            {!hideImage && (
              <HeroCarousel images={images} videoUrl={card?.video?.url} />
            )}
            <Description
              className={hideImage ? "pt-0" : ""}
              description={card?.description}
              highlighting={card?.highlighting}
            />
            <FactsList
              className={card?.description ? "pt-3" : "pt-0"}
              facts={capElements(3, card?.facts)}
            />
          </div>
        </div>

        <p className="mt-4 flex items-baseline justify-end gap-x-2 bg-transparent text-[0.8125rem]/6 text-gray-500 lg:hidden">
          Brought to you by Gan Tu
        </p>
      </div>
    </div>
  );
}
