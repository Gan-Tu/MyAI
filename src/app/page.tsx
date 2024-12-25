"use client";

import { entityCardSchema } from "@/lib/schema";
import { ImageSearchResult } from "@/lib/types";
import { experimental_useObject as useObject } from "ai/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Description from "./_components/description";
import FactsList from "./_components/fact-list";
import Header from "./_components/header";
import ImageCarousel from "./_components/image-carousel";
import { searchImage } from "./actions";

export default function Chat() {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<ImageSearchResult[] | null>(null);
  const [hideImage, setHideImage] = useState(false);
  const router = useRouter();
  const {
    object: card,
    submit,
    isLoading,
    stop
  } = useObject({
    api: "/api/ai-topics",
    schema: entityCardSchema
  });

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.refresh();
    setImages(null);
    setHideImage(false);
    submit(input);
    fetchImages();
  };

  return (
    <div className="flex  flex-col w-full max-w-md mx-auto stretch max-h-screen min-w-[500px] no-scrollbar pb-20 overflow-scroll min-h-screen">
      <div className="my-auto">
        <div className="max-w-xl bg-white rounded-lg shadow-lg">
          <Header title={card?.title} subtitle={card?.subtitle} />
          {!hideImage && <ImageCarousel images={images} />}
          <Description
            className={hideImage ? "pt-0" : ""}
            description={card?.description}
            highlighting={card?.highlighting}
          />
          <FactsList facts={card?.facts} />
        </div>
      </div>

      {isLoading && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => stop()}
            className="bg-black text-white px-4 py-2 mb-4 rounded"
          >
            Stop loading...
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl overflow-hidden"
          value={input}
          placeholder="Search something..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
