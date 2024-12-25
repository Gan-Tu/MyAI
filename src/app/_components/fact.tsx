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
    <div className={className}>
      <h2 className="text-sm font-medium text-gray-900">
        {name || (
          <div className="min-h-6 w-[150px] animate-pulse bg-slate-200 rounded col-span-2" />
        )}
      </h2>
      <p className={"mt-1 text-lg font-semibold"}>
        {shortAnswer ? (
          <MemoizedMarkdown id={`${name}-short`} content={shortAnswer} />
        ) : (
          <div className="min-h-6 w-full animate-pulse bg-slate-200 rounded col-span-2" />
        )}
      </p>
      {isExpanded && (
        <p className="mt-1 font-normal text-sm">
          <MemoizedMarkdown id={`${name}-full`} content={fullAnswer} />
        </p>
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
          <div className="min-h-6 w-[100px] animate-pulse bg-slate-200 rounded col-span-2" />
        )}
      </button>
    </div>
  );
}
