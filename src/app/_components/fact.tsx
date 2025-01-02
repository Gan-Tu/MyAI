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

/* eslint-disable @next/next/no-img-element */
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { useColorTheme } from "@/hooks/color-theme";
import { useResetExpansion } from "@/hooks/reset-expansion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Loader from "./loader";

interface FactProps {
  name?: string;
  shortAnswer?: string;
  fullAnswer?: string;
  className?: string;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

export default function Fact({
  isExpanded,
  setIsExpanded,
  name,
  shortAnswer,
  fullAnswer,
  className,
}: FactProps) {
  const noContent = !(name && shortAnswer);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const { resetFlag } = useResetExpansion();
  const { colorTheme } = useColorTheme();

  useEffect(() => {
    // Calculate the full content height dynamically
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (resetFlag) {
      setIsExpanded(false);
    }
  }, [resetFlag, setIsExpanded]);

  if (noContent) {
    return <Loader className={`min-h-16 ${className}`} />;
  }

  return (
    <AnimatePresence>
      <motion.button
        onClick={() => {
          if (!noContent) {
            setIsExpanded(!isExpanded);
          }
        }}
        className={clsx(
          className,
          "flex flex-col items-start justify-start rounded-xl transition-all duration-200 ease-in-out",
          isExpanded ? "col-span-full p-2" : "p-4",
          !isExpanded && colorTheme,
        )}
      >
        {/* Header */}
        <motion.div className="flex min-w-full justify-between transition-all duration-200 ease-in-out">
          <h2
            className={`text-left text-sm font-semibold text-gray-900 ${
              isExpanded ? "text-[1.125rem]" : "text-base"
            }`}
          >
            {name || <Loader className="min-h-6 w-[100px]" />}
          </h2>
          <ChevronDownIcon
            className={clsx(
              "transition-all duration-200 ease-in-out",
              isExpanded ? "h-7 w-7 rotate-180 rounded-xl p-1" : "h-5 w-5",
              isExpanded && colorTheme,
            )}
          />
        </motion.div>

        {/* Short Answer */}
        {!isExpanded && (
          <motion.span
            className={`mt-1 text-pretty text-left text-sm font-normal transition-all duration-200 ease-in-out ${
              isExpanded ? "" : "line-clamp-2"
            }`}
          >
            {shortAnswer ? (
              <MemoizedMarkdown id={`${name}-short`} content={shortAnswer} />
            ) : (
              <Loader className="min-h-6 w-[150px]" />
            )}
          </motion.span>
        )}

        {/* Expandable Full Answer */}
        {isExpanded && fullAnswer && (
          <motion.div
            ref={contentRef}
            className="overflow-hidden text-pretty text-left transition-all duration-200 ease-in-out"
            style={{
              maxHeight: contentHeight ? `${contentHeight}px` : "0px",
            }}
          >
            <motion.span className="mt-1 text-sm font-normal">
              <MemoizedMarkdown
                id={`${name}-full`}
                content={fullAnswer?.replace("* ", "  * ")}
              />
            </motion.span>
          </motion.div>
        )}
      </motion.button>
    </AnimatePresence>
  );
}
