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
      <h2 className="text-sm font-medium text-gray-900">{name}</h2>
      <p className={"mt-1 text-lg font-semibold"}>
        <MemoizedMarkdown id={`${name}-short`} content={shortAnswer} />
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
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
