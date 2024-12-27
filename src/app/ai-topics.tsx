"use client";

import { Button } from "@/components/base/button";
import { Label } from "@/components/base/fieldset";
import { Select } from "@/components/base/select";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { useResetExpansion } from "@/hooks/reset-expansion";
import { supportedModels } from "@/lib/models";
import { entityCardSchema } from "@/lib/schema";
import { ImageSearchResult } from "@/lib/types";
import { capElements } from "@/lib/utils";
import * as Headless from "@headlessui/react";
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
}

const exampleIdeas = [
  "luigi mangione",
  "bench press",
  "squid game season 2",
  "last of us hbo season 2",
  "sarenne black slope",
  "willow chip by google",
  "frankfurt ban on night flights",
  "passion fruit martini"
];

export default function AiTopics({ q }: AiTopicsProps) {
  const [input, setInput] = useState(q);
  const [model, setModel] = useState<string>("gpt-4o-mini");
  const [images, setImages] = useState<ImageSearchResult[] | null>(null);
  const [hideImage, setHideImage] = useState(false);
  const [useCache, setUseCache] = useState(true);
  const [card, setCard] = useState<any>(null);
  const { resetExpansion } = useResetExpansion();
  const { object, submit, isLoading, stop, error } = useObject({
    api: "/api/ai-topics",
    schema: entityCardSchema,
    headers: {
      "X-AI-Model": model
    }
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
    <div className="flex flex-col w-full max-w-md mx-auto stretch max-h-screen min-w-[350px] md:min-w-[400px] no-scrollbar pb-20 overflow-scroll min-h-screen">
      <div className="my-auto">
        <div className="max-w-xl bg-white rounded-lg shadow-lg">
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

      {isLoading && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => stop()}
            className="bg-black text-white px-2 py-2 mb-4 rounded"
          >
            Stop loading...
          </button>
        </div>
      )}

      <div className="p-5">
        <div className="mt-5 space-x-4">
          Cache: <b>{useCache ? "enabled" : "disabled"}</b>
          <Button
            outline
            onClick={() => setUseCache(!useCache)}
            className="text-white px-4 py-2 mb-4 rounded"
          >
            toggle
          </Button>
        </div>

        <div className="text-sm my-4">
          <MemoizedMarkdown
            id="example-prompts"
            content={`Here are some ideas:\n\n    ${exampleIdeas
              .map((item, index) => `${index + 1}. ${item}`)
              .join("\n    ")}`}
          />
        </div>
        <Headless.Field className="flex items-baseline justift-center gap-6">
          <Label className="flex-grow font-bold min-w-fit">Select Model:</Label>
          <Select
            name="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {supportedModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
        </Headless.Field>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md mx-auto stretch p-2 mb-8 border border-gray-300 rounded shadow-xl overflow-hidden"
          value={input}
          placeholder="Search something..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
