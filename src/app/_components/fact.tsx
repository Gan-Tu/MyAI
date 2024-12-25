import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { useEffect, useRef, useState } from "react";

interface FactProps {
  name?: string;
  shortAnswer?: string;
  fullAnswer?: string;
  className?: string;
}

export default function Fact({
  name,
  shortAnswer,
  fullAnswer,
  className
}: FactProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null); // Reference to the expandable content
  const [contentHeight, setContentHeight] = useState<number | null>(null); // Track the content's full height

  useEffect(() => {
    // Calculate the full content height dynamically
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded]);

  return (
    <div
      className={`${className} transition-all ease-in-out duration-300 ${
        isExpanded ? "col-span-2" : ""
      }`}
    >
      {/* Header */}
      <h2 className="text-sm font-medium text-gray-900">
        {name || (
          <div className="min-h-6 w-[100px] animate-pulse bg-slate-200 rounded" />
        )}
      </h2>

      {/* Short Answer */}
      <span
        className={`mt-1 text-md font-semibold transition-all ease-in-out duration-300 ${
          !isExpanded ? "line-clamp-2" : ""
        }`}
      >
        {shortAnswer ? (
          <MemoizedMarkdown id={`${name}-short`} content={shortAnswer} />
        ) : (
          <div className="min-h-6 w-full animate-pulse bg-slate-200 rounded" />
        )}
      </span>

      {/* Expandable Full Answer */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all ease-in-out duration-300"
        style={{ maxHeight: contentHeight ? `${contentHeight}px` : "0px" }}
      >
        {fullAnswer && (
          <span className="mt-1 text-sm font-normal">
            <MemoizedMarkdown id={`${name}-full`} content={fullAnswer} />
          </span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        {shortAnswer && name ? (
          isExpanded ? (
            "Show less"
          ) : (
            "Show more"
          )
        ) : (
          <div className="min-h-6 w-[70px] animate-pulse bg-slate-200 rounded" />
        )}
      </button>
    </div>
  );
}
