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
import AnimatedSparkleIcon from "@/components/animated-sparkle";
import CreditFooter from "@/components/credit-footer";
import { useCredits } from "@/hooks/credits";
import { defaultLanguageModel, supportedLanguageModels } from "@/lib/models";
import { WidgetRenderer } from "@tugan/widgets";
import * as Headless from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import NextImage from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type GeneratedWidget = {
  template: string;
  data: Record<string, unknown>;
  theme: "light" | "dark";
  designSpec?: string;
};

type ReferenceImage = {
  id: string;
  name: string;
  dataUrl: string;
};

type GenerationStreamEvent =
  | {
      type: "status";
      message: string;
    }
  | {
      type: "result";
      widget: GeneratedWidget;
    }
  | {
      type: "error";
      error: string;
    };

type GenerativeWidgetsProps = {
  q?: string;
  defaultModel?: string;
};

type WidgetPreviewBoundaryProps = {
  children: React.ReactNode;
  onError: (error: unknown) => void;
};

type WidgetPreviewBoundaryState = {
  hasError: boolean;
};

class WidgetPreviewBoundary extends React.Component<
  WidgetPreviewBoundaryProps,
  WidgetPreviewBoundaryState
> {
  state: WidgetPreviewBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const defaultWidget: GeneratedWidget = {
  template: `
<Card width={400}>
  <Col gap={3}>
    <Row align="center" gap={2}>
      <Icon name="check-circle-filled" color="success" />
      <Text size="sm" value="Purchase complete" color="success" />
    </Row>
    <Divider color="subtle" flush />

    <Row gap={3}>
      <Image src={product.image} alt="Blue folding chair" size={80} frame />
      <Col gap={1}>
        <Title value={product.name} maxLines={2} />
        <Text
          value="Free delivery • 14-day returns"
          size="sm"
          color="secondary"
        />
      </Col>
    </Row>
  </Col>
  <Show $when="size(details) > 0">
    <Col gap={2} padding={{ y: 2 }}>
      <Each $of="details" item="detail">
        <Row>
          <Text $value="detail.label" size="sm" color="secondary" />
          <Spacer />
          <Text $value="detail.value" size="sm" />
        </Row>
      </Each>
    </Col>
  </Show>

  <Button
    label="View details"
    onClickAction={{ type: "order.view_details" }}
    variant="outline"
    pill
    block
  />
</Card>
`.trim(),
  data: {
    product: {
      name: "Blue folding chair",
      image: "https://widgets.chatkit.studio/blue-chair.png",
    },
    details: [
      {
        label: "Estimated delivery",
        value: "Thursday, Oct 8",
      },
      {
        label: "Sold by",
        value: "OpenAI",
      },
      {
        label: "Paid",
        value: "$20.00",
      },
    ],
  },
  theme: "light",
  designSpec: "A compact purchase confirmation widget with product details.",
};

const maxReferenceImages = 3;
const maxReferenceImageBytes = 5 * 1024 * 1024;
const allowedReferenceImageTypes = ["image/png", "image/jpeg", "image/webp"];
const generativeWidgetCreditCost = 5;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatActionPayload(action: unknown) {
  try {
    return JSON.stringify(action, null, 2);
  } catch {
    return String(action);
  }
}

function showActionToast(action: unknown) {
  const payload = formatActionPayload(action);

  toast.custom(
    (toastInstance) => (
      <div
        className={`max-w-md rounded-lg bg-white p-4 text-slate-900 shadow-lg ring-1 ring-slate-200 transition ${
          toastInstance.visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-sm font-medium">Action received</div>
        <pre className="mt-2 max-h-64 overflow-auto font-mono text-xs leading-5 break-words whitespace-pre-wrap text-slate-700">
          {payload}
        </pre>
      </div>
    ),
    { duration: 3500 },
  );
}

export default function GenerativeWidgets({
  q,
  defaultModel,
}: GenerativeWidgetsProps) {
  const [input, setInput] = useState(
    q || "Generate a package tracking history widget.",
  );
  const [model, setModel] = useState(defaultModel || defaultLanguageModel);
  const [widget, setWidget] = useState<GeneratedWidget>(defaultWidget);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(
    "Ready to create a widget",
  );
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [previewKey, setPreviewKey] = useState(0);
  const { deduct } = useCredits();

  useEffect(() => {
    setRenderError(null);
    setPreviewKey((key) => key + 1);
  }, [widget]);

  useEffect(() => {
    if (generationStatus !== "Widget ready") return;

    const timeout = window.setTimeout(() => {
      setGenerationStatus(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [generationStatus]);

  const generateWidget = async () => {
    if (!input.trim()) return;
    if (!(await deduct(generativeWidgetCreditCost, input))) return;

    setIsLoading(true);
    setError(null);
    setRenderError(null);
    setGenerationStatus("Starting");

    try {
      const response = await fetch("/api/generative-widgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AI-Model": model,
        },
        body: JSON.stringify({
          prompt: input,
          referenceImages: referenceImages.map(({ name, dataUrl }) => ({
            name,
            dataUrl,
          })),
        }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Failed to generate widget.");
      }

      if (!response.body) {
        throw new Error("Generation response was empty.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedWidget = false;
      const handleStreamLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line) as GenerationStreamEvent;
        if (event.type === "status") {
          setGenerationStatus(event.message);
        } else if (event.type === "result") {
          receivedWidget = true;
          setWidget({
            template: event.widget.template,
            data: event.widget.data || {},
            theme: event.widget.theme || "light",
            designSpec: event.widget.designSpec,
          });
        } else if (event.type === "error") {
          throw new Error(event.error);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          handleStreamLine(line);
        }

        if (done) {
          if (buffer.trim()) {
            handleStreamLine(buffer);
          }
          break;
        }
      }

      if (!receivedWidget) {
        throw new Error(
          "Generation ended before a widget was returned. It may have timed out.",
        );
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to generate widget.",
      );
      setGenerationStatus("Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    generateWidget();
  };

  const handleReferenceImagesChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = maxReferenceImages - referenceImages.length;
    if (remainingSlots <= 0) {
      toast.error("Remove a reference image before adding another.");
      return;
    }

    const files = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      toast.error(
        `You can attach up to ${maxReferenceImages} reference images.`,
      );
    }

    const validFiles = files.filter((file) => {
      if (!allowedReferenceImageTypes.includes(file.type)) {
        toast.error(`${file.name} must be PNG, JPEG, or WebP.`);
        return false;
      }
      if (file.size > maxReferenceImageBytes) {
        toast.error(`${file.name} must be 5 MB or smaller.`);
        return false;
      }
      return true;
    });

    const images = await Promise.all(
      validFiles.map(async (file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        name: file.name,
        dataUrl: await readFileAsDataUrl(file),
      })),
    );

    setReferenceImages((currentImages) =>
      [...currentImages, ...images].slice(0, maxReferenceImages),
    );
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages((currentImages) =>
      currentImages.filter((image) => image.id !== id),
    );
  };

  const statusPill = generationStatus ? (
    <div className="mt-4 flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/70 px-3 py-1.5 text-xs text-violet-700">
      <span
        className={`h-1.5 w-1.5 rounded-full bg-violet-500 ${
          isLoading ? "animate-pulse" : ""
        }`}
      />
      {generationStatus}
    </div>
  ) : null;

  return (
    <div className="font-display mx-auto my-auto flex h-full w-full max-w-6xl grow flex-col pb-4 lg:flex-row dark:bg-gray-950">
      <div className="relative flex min-w-[400px] grow flex-col justify-center overflow-hidden px-6 lg:pointer-events-none lg:inset-0 lg:z-40 lg:flex lg:w-1/2 lg:px-0">
        <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] lg:overflow-x-hidden lg:overflow-y-auto lg:pl-[max(4rem,calc(50%-38rem))]">
          <div className="mx-auto w-full max-w-md min-w-[350px] md:min-w-[400px] lg:mx-0 lg:flex lg:w-96 lg:flex-col lg:before:flex-1 lg:before:pt-6">
            <div className="pb-10 sm:pt-32 sm:pb-20 lg:py-20 lg:pt-20">
              <div className="relative">
                <h1 className="text-slate mt-14 text-4xl/tight font-light text-pretty">
                  Generative Widgets{" "}
                  <span className="text-violet-500">from any prompt</span>
                </h1>
                <p className="mt-4 text-sm/6 text-slate-700">
                  Create compact, data-backed dynamic widget interfaces from
                  simple prompts!
                </p>

                <div className="text-slate flex flex-col gap-6 py-4 text-pretty md:gap-4">
                  <Headless.Field className="flex items-baseline justify-center gap-6">
                    <Label className="grow text-sm font-semibold">Model</Label>
                    <Select
                      name="model"
                      value={model}
                      onChange={(event) => setModel(event.target.value)}
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative isolate mt-4 text-sm">
                    <label className="sr-only">Widget prompt</label>
                    <textarea
                      required
                      name="prompt"
                      autoFocus={true}
                      value={input}
                      placeholder="Generate a travel itinerary widget..."
                      className="peer w-full cursor-text bg-transparent px-4 py-2.5 text-base text-slate-800 placeholder:text-zinc-400 focus:outline-hidden disabled:text-gray-500 lg:text-sm"
                      onChange={(event) => setInput(event.target.value)}
                      rows={7}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 peer-focus:ring-violet-300/15" />
                    <div className="bg-slate/2.5 ring-slate/15 absolute inset-0 -z-10 rounded-lg ring-1 ring-violet-400/50 transition peer-focus:ring-violet-300" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs text-slate-500">
                        Optional reference images, up to 3
                      </p>
                      <div className="grow" />
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50">
                        <PhotoIcon className="h-3.5 w-3.5" />
                        Add images
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          className="sr-only"
                          disabled={
                            isLoading ||
                            referenceImages.length >= maxReferenceImages
                          }
                          onChange={handleReferenceImagesChange}
                        />
                      </label>
                      <Button
                        type="submit"
                        className="my-1 max-h-10 cursor-pointer text-sm"
                        disabled={isLoading}
                      >
                        <AnimatedSparkleIcon className="h-3 w-3 fill-violet-400" />
                        {isLoading ? "Generating..." : "Generate"}
                      </Button>
                    </div>
                    {referenceImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {referenceImages.map((image) => (
                          <div
                            key={image.id}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white"
                          >
                            <NextImage
                              src={image.dataUrl}
                              alt={image.name}
                              fill
                              sizes="120px"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              aria-label={`Remove ${image.name}`}
                              className="absolute top-1 right-1 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900"
                              onClick={() => removeReferenceImage(image.id)}
                              disabled={isLoading}
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </form>

                {error ? (
                  <div className="mt-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="hidden flex-1 items-end pb-4 lg:block lg:justify-start lg:pb-6">
              <CreditFooter decorationColor="decoration-violet-300/[.66]" />
            </div>
          </div>
        </div>
      </div>

      <div className="stretch no-scrollbar mx-auto flex min-h-[28rem] w-full max-w-[600px] min-w-[350px] grow flex-col items-center justify-center gap-4 overflow-y-auto pt-8 pb-10 md:min-w-[400px] lg:mx-6 lg:min-h-[calc(100vh-3rem)] lg:w-1/2 lg:pt-0">
        <div className="flex w-full flex-col items-center justify-center p-5">
          {isLoading ? (
            <div className="flex min-h-[18rem] w-full items-center justify-center">
              {statusPill}
            </div>
          ) : (
            <>
              <WidgetPreviewBoundary
                key={previewKey}
                onError={(caught) =>
                  setRenderError(
                    caught instanceof Error
                      ? caught.message
                      : "Preview failed to render.",
                  )
                }
              >
                <div className="flex w-full max-w-[600px] justify-center">
                  <WidgetRenderer
                    template={widget.template}
                    data={widget.data}
                    theme={widget.theme}
                    onAction={showActionToast}
                  />
                </div>
              </WidgetPreviewBoundary>
              {renderError ? (
                <div className="mt-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                  <p>{renderError}</p>
                </div>
              ) : null}
              {widget.designSpec ? (
                <p className="mt-4 text-center text-sm leading-5 text-slate-600">
                  {widget.designSpec}
                </p>
              ) : null}
              {statusPill}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
