"use client";

import { Button } from "@/components/base/button";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { entityCardSchema } from "@/lib/schema";
import { ImageSearchResult } from "@/lib/types";
import { capElements } from "@/lib/utils";
import { experimental_useObject as useObject } from "ai/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Description from "./_components/description";
import FactsList from "./_components/fact-list";
import Header from "./_components/header";
import ImageCarousel from "./_components/image-carousel";
import { getCachedAiTopics, searchImage } from "./actions";

export default function AiTopics() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("q") || null);
  const [images, setImages] = useState<ImageSearchResult[] | null>(null);
  const [hideImage, setHideImage] = useState(false);
  const [useCache, setUseCache] = useState(true);
  const [card, setCard] = useState<any>(null);
  const router = useRouter();
  const { object, submit, isLoading, stop } = useObject({
    api: "/api/ai-topics",
    schema: entityCardSchema
  });

  useEffect(() => {
    if (object) {
      setCard(object);
    }
  }, [object]);

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
      const { data: cache, error } = await getCachedAiTopics(input);
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

  const fetchData = async () => {
    fetchEntityCard();
    fetchImages();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.refresh();
    setImages(null);
    setHideImage(false);
    fetchData();
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto stretch max-h-screen min-w-[350px] md:min-w-[400px] no-scrollbar pb-20 overflow-scroll min-h-screen">
      <div className="my-auto">
        <div className="max-w-xl bg-white rounded-lg shadow-lg">
          <Header title={card?.title} subtitle={card?.subtitle} />
          {!hideImage && <ImageCarousel images={images} />}
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
            content={`Here are some ideas:\n\n    1. sarenne black slope\n    2. willow chip by google\n    3. frankfurt ban on night flights\n    4. passion fruit martini`}
          />
        </div>
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
