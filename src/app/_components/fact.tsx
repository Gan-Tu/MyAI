import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { useState } from "react";

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

  return (
    <div
      className={`${className} ${
        isExpanded && "col-span-2"
      } transition ease-in-out`}
    >
      <h2 className="text-sm font-medium text-gray-900 text-pretty">
        {name || (
          <div className="min-h-6 w-[100px] animate-pulse bg-slate-200 rounded" />
        )}
      </h2>
      <span
        className={`mt-1 text-md font-semibold ${
          !isExpanded && "line-clamp-2"
        }`}
      >
        {shortAnswer ? (
          <MemoizedMarkdown id={`${name}-short`} content={shortAnswer} />
        ) : (
          <div className="min-h-6 w-full animate-pulse bg-slate-200 rounded" />
        )}
      </span>
      {isExpanded && (
        <span className="mt-1 font-normal text-sm">
          <MemoizedMarkdown id={`${name}-full`} content={fullAnswer} />
        </span>
      )}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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
