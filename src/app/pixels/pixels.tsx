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

import AnimatedSparkleIcon from "@/components/animated-sparkle";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/fieldset";
import { Select } from "@/components/base/select";
import { Switch, SwitchField } from "@/components/base/switch";
import CreditFooter from "@/components/credit-footer";
import { useCredits } from "@/hooks/credits";
import { useSession } from "@/hooks/session";
import { getImageModelMetadata, supportedImageModels } from "@/lib/models";
import { type ImageModelMetadata, type ImageModelParameter } from "@/lib/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import * as Headless from "@headlessui/react";
import { PhotoIcon } from "@heroicons/react/20/solid";
import { JSONValue } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import OutputGallery from "./image-loader";

interface ImagesPageProps {
  q?: string;
  defaultModel: string;
}

export default function PixelsPage({ q, defaultModel }: ImagesPageProps) {
  const [input, setInput] = useState(q);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [model, setModel] = useState<string>(defaultModel);
  const [providerOptions, setProviderOptions] = useState({});
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { deduct } = useCredits();
  const { user } = useSession();
  const router = useRouter();

  // Memoize modelSpec and parameters to prevent unnecessary recalculations
  const modelSpec: ImageModelMetadata | null = useMemo(
    () => getImageModelMetadata(model),
    [model],
  );
  const creditsCost: number = modelSpec?.creditsCost || 1;

  const parameters: ImageModelParameter[] = useMemo(() => {
    const params: ImageModelParameter[] = [];
    if (modelSpec?.aspectRatio?.length) {
      params.push({
        name: "aspect_ratio",
        options: modelSpec.aspectRatio,
      });
    }
    return params.concat(modelSpec?.parameters || []);
  }, [modelSpec]);

  useEffect(() => {
    if (parameters.length > 0) {
      const options: Record<string, JSONValue> = parameters.reduce(
        (acc, element) => {
          if ("options" in element) {
            acc[element.name] = element.options[0];
          } else {
            acc[element.name] = element.default;
          }
          return acc;
        },
        {} as Record<string, JSONValue>,
      );
      setProviderOptions(options);
    }
  }, [parameters]);

  const fetchPrediction = async () => {
    if (!input) {
      return;
    }
    if (!(await deduct(creditsCost, input))) {
      return;
    }
    const res = await fetch("/api/pixels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${modelSpec?.promptPrefix || ""}${input}${modelSpec?.promptSuffix || ""}`,
        modelName: model,
        options: providerOptions,
        userId: user?.uid || "",
      }),
    });
    const { url } = await res.json();
    setImageUrl(url);
    return;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setImageUrl(null);
    setIsLoading(true);
    fetchPrediction()
      .catch((error) => {
        console.error(error);
        toast.error("Failed to generate image");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 lg:flex-row dark:bg-gray-950">
      {/* Info Card*/}
      <div className="relative flex min-w-[400px] grow flex-col justify-center overflow-hidden px-6 lg:inset-0 lg:flex lg:w-3/8 lg:px-0">
        <div className="relative flex w-full lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-x-hidden lg:overflow-y-auto lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto w-full max-w-md min-w-[350px] md:min-w-[400px] lg:mx-0 lg:flex lg:w-96 lg:flex-col lg:before:flex-1 lg:before:pt-6">
            <div className="pb-10 sm:pt-32 sm:pb-20 lg:py-20 lg:pt-20">
              <div className="relative">
                {/* Intro */}
                <h1 className="text-slate mt-14 text-4xl/tight font-light text-pretty">
                  Pixel Crafter <span className="text-purple-500">by AI</span>
                </h1>
                <p className="mt-4 text-sm/6 text-slate-700">
                  Transform your ideas into breathtaking visuals with
                  PixelCrafter, the AI-powered tool that generates stunning
                  images in any style. From hyper-realistic designs to artistic
                  masterpieces, PixelCrafter brings your imagination to life
                  effortlessly.
                </p>

                {/* View Images Generation */}
                <Button
                  color="white"
                  className="my-2 ml-auto max-h-10 w-full"
                  onClick={() => router.push("/pixels/my")}
                >
                  <PhotoIcon className="w- h-3 fill-white" />
                  <span className="text-sm font-medium">
                    Click here to view my past generations
                  </span>
                </Button>

                {/* Controls */}
                <div className="text-slate flex flex-col gap-6 py-4 text-pretty md:gap-4">
                  <Headless.Field className="justift-center flex items-baseline gap-6">
                    <Label className="grow text-sm font-semibold">Model</Label>
                    <Select
                      name="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="max-w-fit text-sm"
                      disabled={isLoading}
                    >
                      {supportedImageModels.map((model) => (
                        <option
                          key={model.displayName}
                          value={model.displayName}
                          className="text-end text-sm"
                        >
                          {model.displayName}
                        </option>
                      ))}
                    </Select>
                  </Headless.Field>
                  {parameters.map((param) =>
                    "options" in param ? (
                      <Headless.Field
                        key={param.name}
                        className="justift-center flex items-baseline gap-6"
                      >
                        <Label className="grow text-sm font-semibold">
                          {capitalizeFirstLetter(
                            param.name.replace(/[-_]/g, " "),
                          )}
                        </Label>
                        <Select
                          name={param.name}
                          defaultValue={param.options[0]}
                          className="max-w-fit text-sm"
                          disabled={isLoading}
                          onChange={(e) => {
                            setProviderOptions({
                              ...providerOptions,
                              [param.name]: e.target.value,
                            });
                          }}
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
                    ) : (
                      <SwitchField
                        key={param.name}
                        className="justift-center flex cursor-pointer items-baseline gap-6"
                      >
                        <Label className="grow text-sm font-semibold">
                          {capitalizeFirstLetter(
                            param.name.replace(/[-_]/g, " "),
                          )}
                        </Label>
                        <Switch
                          name={param.name}
                          defaultChecked={param.default}
                          disabled={isLoading}
                          onChange={(val) => {
                            setProviderOptions({
                              ...providerOptions,
                              [param.name]: val,
                            });
                          }}
                        />
                      </SwitchField>
                    ),
                  )}
                </div>
                {/* Prompt */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative isolate mt-4 text-sm">
                    <label className="sr-only">Descriptions</label>
                    <textarea
                      required
                      name="text"
                      autoFocus={true}
                      value={input}
                      placeholder={
                        modelSpec?.descriptionPlaceholder ||
                        "Enter your description here..."
                      }
                      className="peer w-full cursor-text bg-transparent px-4 py-2.5 text-base text-slate-800 placeholder:text-zinc-400 focus:outline-hidden disabled:text-gray-500 lg:text-sm"
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setInput(e.target.value)
                      }
                      rows={10}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-purple-300/15" />
                    <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 ring-purple-400/50 transition peer-focus:ring-purple-300" />
                  </div>

                  <div className="flex items-end">
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
      {(isLoading || imageUrl) && (
        <OutputGallery
          className="stretch no-scrollbar mx-auto max-h-screen w-full max-w-lg min-w-[350px] grow pb-10 md:min-w-[400px] lg:mx-6 lg:w-5/8 lg:max-w-xl lg:pt-20"
          isLoading={isLoading}
          prompt={input || ""}
          imageUrl={imageUrl || ""}
        />
      )}
    </div>
  );
}
