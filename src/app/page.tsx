"use client";

import { entityCardSchema } from "@/lib/schema";
import { experimental_useObject as useObject } from "ai/react";
import { useState } from "react";
import Description from "./_components/description";
import FactsList from "./_components/fact-list";
import Header from "./_components/header";

export default function Chat() {
  const [input, setInput] = useState("");
  const {
    object: card,
    submit,
    isLoading,
    stop
  } = useObject({
    api: "/api/ai-topics",
    schema: entityCardSchema
  });

  return (
    <div className="flex flex-col w-full max-w-md mx-auto stretch max-h-screen min-w-[400px]">
      {isLoading && (
        <div>
          <div>Loading...</div>
          <button
            type="button"
            onClick={() => stop()}
            className="bg-black text-white px-4 py-2 mb-4 rounded"
          >
            Stop
          </button>
        </div>
      )}

      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 overflow-scroll pb-20">
        <div className="max-w-xl bg-white rounded-lg shadow-lg">
          <Header title={card?.title} subtitle={card?.subtitle} />
          <Description
            description={card?.description}
            highlighting={card?.highlighting}
          />
          <FactsList facts={card?.facts} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl overflow-hidden"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
