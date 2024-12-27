import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { useResetExpansion } from "@/hooks/reset-expansion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
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
  className
}: FactProps) {
  const noContent = !(name && shortAnswer);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const { resetFlag } = useResetExpansion();

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
  }, [resetFlag]);

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
        className={`${className} transition-all ease-in-out duration-200 justify-start rounded-xl flex flex-col items-start ${
          isExpanded ? "col-span-full p-2" : "bg-blue-100 p-4"
        }`}
      >
        {/* Header */}
        <motion.div className="flex min-w-full justify-between transition-all ease-in-out duration-200">
          <h2
            className={`text-sm font-semibold text-gray-900 text-left ${
              isExpanded ? "text-[1.125rem]" : "text-base"
            }`}
          >
            {name || <Loader className="min-h-6 w-[100px]" />}
          </h2>
          <ChevronDownIcon
            className={`transition-all ease-in-out duration-200 ${
              isExpanded
                ? "w-7 h-7 rounded-xl p-1 bg-blue-100 rotate-180"
                : "w-5 h-5"
            }`}
          />
        </motion.div>

        {/* Short Answer */}
        {!isExpanded && (
          <motion.span
            className={`mt-1 font-normal text-sm text-left transition-all ease-in-out duration-200 text-pretty ${
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
        {fullAnswer && (
          <motion.div
            ref={contentRef}
            className="overflow-hidden transition-all text-left ease-in-out duration-200 text-pretty"
            style={{
              maxHeight: contentHeight ? `${contentHeight}px` : "0px"
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
