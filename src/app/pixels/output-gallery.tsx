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

import CreditFooter from "@/components/credit-footer";
import { PredictionWithInput } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";

interface OutputGalleryProps {
  isLoading: boolean;
  prediction?: PredictionWithInput | null | undefined;
  className?: string;
}

/* eslint-disable @next/next/no-img-element */
export default function OutputGallery({
  isLoading,
  prediction,
  className,
}: OutputGalleryProps) {
  let imageUrl =
    prediction?.status === "succeeded"
      ? Array.isArray(prediction?.output)
        ? prediction.output[0]
        : prediction.output
      : null;

  return (
    <div
      className={clsx(
        className,
        "lg:w-3/8 relative flex min-w-[400px] flex-grow flex-col justify-center overflow-hidden px-7 lg:inset-0 lg:z-40 lg:flex lg:px-0",
      )}
    >
      {imageUrl && (
        <Link href={imageUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={imageUrl}
            height={768}
            width={768}
            sizes="100vw"
            className="aspect-auto rounded-lg object-cover"
            alt={prediction?.input?.prompt || "output image"}
          />
        </Link>
      )}

      {isLoading && (
        <div className="flex aspect-square w-full place-content-center items-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-sm font-semibold text-gray-500 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Image Loading
        </div>
      )}

      <CreditFooter
        className="mt-4 justify-end bg-transparent lg:hidden"
        decorationColor="decoration-green-300/[.66]"
      />
    </div>
  );
}
