import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { useResetExpansion } from "@/hooks/reset-expansion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";

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
    return (
      <div
        className={`min-h-16 animate-pulse bg-slate-200 rounded ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => {
        if (!noContent) {
          setIsExpanded(!isExpanded);
        }
      }}
      // index === 0
      //   ? "bg-blue-100" // border border-blue-200
      //   : index === 1
      //   ? "bg-lime-100" // border border-green-200
      //   : "bg-amber-100" // border border-yellow-200
      className={`${className} transition-all justify-start ease-in-out duration-300 rounded-xl ${
        isExpanded ? "col-span-full p-2" : "bg-blue-100 p-4"
      } grid content-start`}
    >
      {/* Header */}
      <div className="flex justify-between items-start  transition-all ease-in-out duration-300">
        <h2
          className={`text-sm font-semibold text-gray-900 text-left ${
            isExpanded ? "text-lg" : "text-md"
          }`}
        >
          {name || (
            <div className="min-h-6 w-[100px] animate-pulse bg-slate-300 rounded" />
          )}
        </h2>
        {isExpanded ? (
          <ChevronUpIcon className="w-7 h-7 justify-end rounded-xl p-1 bg-blue-100" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 justify-end" />
        )}
      </div>

      <div className="flex flex-col justify-start items-start text-left align-middle">
        {/* Short Answer */}
        <span
          className={`mt-1 font-normal text-sm text-left transition-all ease-in-out duration-300 ${
            isExpanded ? "" : "line-clamp-2"
          }`}
        >
          {shortAnswer ? (
            <MemoizedMarkdown id={`${name}-short`} content={shortAnswer} />
          ) : (
            <div className="min-h-6 w-[150px] animate-pulse bg-slate-300 rounded" />
          )}
        </span>

        {/* Expandable Full Answer */}
        {fullAnswer && (
          <div
            ref={contentRef}
            className="overflow-hidden transition-all ease-in-out duration-300 text-left mt-2"
            style={{ maxHeight: contentHeight ? `${contentHeight}px` : "0px" }}
          >
            <span className="mt-1 text-sm font-normal text-left">
              <MemoizedMarkdown
                id={`${name}-full`}
                content={fullAnswer?.replace("* ", "  * ")}
              />
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
