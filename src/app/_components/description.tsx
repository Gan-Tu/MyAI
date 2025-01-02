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

import { useColorTheme } from "@/hooks/color-theme";
import { useResetExpansion } from "@/hooks/reset-expansion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import Loader from "./loader";

interface DescriptionProps {
  description?: string;
  highlighting?: string;
  className?: string;
}

export default function Description({
  description,
  highlighting,
  className,
}: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [needsExpander, setNeedsExpander] = useState(false); // New state
  const contentRef = useRef<HTMLDivElement>(null);
  const { resetFlag } = useResetExpansion();
  const { colorTheme } = useColorTheme();

  useEffect(() => {
    if (contentRef.current) {
      // Check if content overflows the initial max height
      const scrollHeight = contentRef.current.scrollHeight;
      const maxHeight = 7.5 * 16; // 7.5rem in pixels (assuming 16px for text-base)
      setNeedsExpander(scrollHeight > maxHeight); // Determine if expander is needed
      setContentHeight(
        isExpanded ? scrollHeight : Math.min(scrollHeight, maxHeight),
      );
    }
  }, [isExpanded, description]);

  useEffect(() => {
    if (resetFlag) {
      setIsExpanded(false);
    }
  }, [resetFlag]);

  if (!description) {
    return (
      <div className="p-5">
        <div className="inline space-y-1 text-sm text-gray-700">
          <Loader className="col-span-2 min-h-6 w-full" />
          <Loader className="col-span-2 min-h-6 w-full" />
          <Loader className="col-span-2 min-h-6 w-[200px]" />
        </div>
      </div>
    );
  }

  const [beforeHighlight, afterHighlight] =
    description && highlighting && description.includes(highlighting)
      ? [
          description.slice(0, description.indexOf(highlighting)),
          description.slice(
            description.indexOf(highlighting) + highlighting.length,
          ),
        ]
      : [description || "", ""];

  return (
    <div
      className={`relative p-5 pb-3 ${className} ${
        isExpanded ? "pb-[2rem]" : ""
      }`}
    >
      {/* Content container with smooth height transition */}
      <div className="relative">
        <div
          className="line-height-[1.5rem] overflow-hidden text-base transition-all duration-300 ease-in-out"
          style={{
            maxHeight: contentHeight ? `${contentHeight}px` : "7.5rem",
          }}
        >
          <div ref={contentRef}>
            {beforeHighlight}
            {highlighting && afterHighlight && (
              <span className={clsx("px-[0.15rem] font-semibold", colorTheme)}>
                {highlighting}
              </span>
            )}
            {afterHighlight}
          </div>
        </div>
        {needsExpander && ( // Conditionally render expander
          <button
            className={`absolute bottom-0 right-0 flex cursor-pointer items-center rounded-xl bg-slate-100 py-[0.15rem] pl-2 pr-1 text-center text-[0.8rem] backdrop-blur-md backdrop-opacity-15 transition-all duration-300 ease-in-out ${
              isExpanded ? "translate-y-[1.7rem]" : ""
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Less" : "More"}
            <ChevronDownIcon
              className={`h-4 w-4 justify-end transition-all duration-200 ease-in-out ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
