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
import { VISION_MODELS } from "@/lib/models";
import { capitalizeFirstLetter } from "@/lib/utils";
import * as Headless from "@headlessui/react";
import { sleep } from "openai/core.mjs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { type Prediction } from "replicate";
import AnimatedSparkleIcon from "../../components/animated-sparkle";
import CreditFooter from "../../components/credit-footer";
import { predictWithReplicate } from "../actions";
import OutputGallery from "./output-gallery";

interface ImagesPageProps {
  q?: string;
  defaultModel?: string;
}

export default function PixelsPage({ q, defaultModel }: ImagesPageProps) {
  const [input, setInput] = useState(q);
  const [extraInputs, setExtraInputs] = useState({});
  const [creditsCost, setCreditsCost] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [model, setModel] = useState<string>(defaultModel || "AI Emoji");
  const [curPrediction, setCurPrediction] = useState<Prediction | null>(null);
  const { deduct } = useCredits();

  useEffect(() => {
    let modelConfig = VISION_MODELS[model];
    if (modelConfig) {
      setCreditsCost(modelConfig.creditsCost);
      let params = {};
      modelConfig.parameters?.forEach((element) => {
        params = { ...params, [element.name]: element.default };
      });
      setExtraInputs(params);
    }
  }, [model]);

  const fetchPrediction = async () => {
    if (!input) {
      return;
    }
    if (!(await deduct(creditsCost))) {
      return;
    }
    let { error, prediction } = await predictWithReplicate(
      {
        prompt: input,
        ...extraInputs,
      },
      /*model*/ VISION_MODELS[model]?.model,
      /*version*/ VISION_MODELS[model]?.version,
    );
    if (error) {
      throw new Error(error as string);
    }
    setCurPrediction(prediction || null);

    // Poll Prediction
    while (
      prediction &&
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(2000);
      const response = await fetch(
        "/api/replicate/predictions/" + prediction.id,
        { cache: "no-store", next: { revalidate: 0 } },
      );
      let body = await response.json();
      if (response.status !== 200) {
        throw new Error(body.error);
      }
      prediction = body.prediction;
      if (prediction) {
        setCurPrediction(prediction);
      }
    }
    if (prediction?.status === "failed") {
      throw new Error(prediction.error as string);
    } else if (prediction?.status === "succeeded") {
      setIsLoading(false);
    }
    return;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurPrediction(null);
    setIsLoading(true);
    fetchPrediction()
      .catch((error) => {
        console.error(error);
        toast.error("Failed to generate image");
      })
      .finally(() => setIsLoading(false));
  };

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
                  Pixel Crafter <span className="text-purple-500">by AI</span>
                </h1>
                <p className="mt-4 text-sm/6 text-slate-700">
                  Transform your ideas into breathtaking visuals with
                  PixelCrafter, the AI-powered tool that generates stunning
                  images in any style. From hyper-realistic designs to artistic
                  masterpieces, PixelCrafter brings your imagination to life
                  effortlessly.
                </p>
                {/* Controls */}
                <div className="text-slate flex flex-col gap-6 text-pretty py-4 md:gap-4">
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
                      {Object.keys(VISION_MODELS).map((model) => (
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
                  {VISION_MODELS[model]?.parameters?.map((param) => (
                    <Headless.Field
                      key={param.name}
                      className="justift-center flex items-baseline gap-6"
                    >
                      <Label className="flex-grow text-sm font-semibold">
                        {param.displayName || capitalizeFirstLetter(param.name)}
                      </Label>
                      <Select
                        name={param.name}
                        defaultValue={param.default}
                        className="max-w-fit text-sm"
                        disabled={isLoading}
                        onChange={(e) =>
                          setExtraInputs({
                            ...extraInputs,
                            [param.name]: e.target.value,
                          })
                        }
                      >
                        {param.options.map((val: string, index: number) => (
                          <option
                            key={`${param.name}-${index}`}
                            value={val}
                            className="text-end text-sm"
                          >
                            {val}
                          </option>
                        ))}
                      </Select>
                    </Headless.Field>
                  ))}
                </div>

                {/* Search Query */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative isolate mt-4 text-sm">
                    <label className="sr-only">Descriptions</label>
                    <textarea
                      required
                      name="text"
                      autoFocus={true}
                      value={input}
                      placeholder="Enter your description here..."
                      className="peer w-full cursor-text bg-transparent px-4 py-2.5 text-base text-slate-800 placeholder:text-zinc-400 focus:outline-none disabled:text-gray-500 lg:text-sm"
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setInput(e.target.value)
                      }
                      rows={10}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-purple-300/15" />
                    <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 ring-purple-400/50 transition peer-focus:ring-purple-300" />
                  </div>

                  <div className="flex flex-col items-end">
                    <Button
                      type="submit"
                      className="my-1 ml-auto max-h-10 text-sm"
                      disabled={isLoading}
                    >
                      <AnimatedSparkleIcon className="h-3 w-3 fill-purple-400" />
                      {isLoading ? "Imagining..." : "Imagine"}
                      {creditsCost > 1 && (
                        <span className="text-xs font-light">
                          ({creditsCost} Credits)
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            <div className="hidden flex-1 items-end pb-4 lg:block lg:justify-start lg:pb-6">
              <CreditFooter decorationColor="decoration-purple-300/[.66]" />
            </div>
          </div>
        </div>
      </div>

      {/* Output Gallery */}
      {(isLoading || curPrediction) && (
        <OutputGallery
          className="stretch no-scrollbar lg:w-5/8 mx-auto max-h-screen w-full min-w-[350px] max-w-lg flex-grow pb-10 md:min-w-[400px] lg:mx-6 lg:max-w-xl lg:pt-20"
          isLoading={isLoading}
          prediction={curPrediction}
        />
      )}
    </div>
  );
}
