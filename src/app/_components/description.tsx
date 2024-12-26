import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";

interface DescriptionProps {
  description?: string;
  highlighting?: string;
  className?: string;
}

export default function Description({
  description,
  highlighting,
  className
}: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded]);

  if (!description) {
    return (
      <div className="p-6">
        <div className="text-gray-700 text-sm inline space-y-1">
          <div className="min-h-6 w-full animate-pulse bg-slate-200 rounded col-span-2" />
          <div className="min-h-6 w-full animate-pulse bg-slate-200 rounded col-span-2" />
          <div className="min-h-6 w-[200px] animate-pulse bg-slate-200 rounded col-span-2" />
        </div>
      </div>
    );
  }

  const [beforeHighlight, afterHighlight] = description.split(
    highlighting || ""
  );

  return (
    <div className={`p-6 pb-3 relative ${className}`}>
      {/* Content container with smooth height transition */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out relative line-height-[1.5rem]"
        style={{
          maxHeight: contentHeight ? `${contentHeight}px` : "7.5rem"
        }}
      >
        <div ref={contentRef}>
          <p>
            {beforeHighlight}
            {highlighting && (
              <span className="font-semibold bg-amber-100 px-1">
                {highlighting}
              </span>
            )}
            {afterHighlight}
          </p>
        </div>

        <button
          className="text-blue-600 text-sm cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Less" : "More"}
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 justify-end" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 justify-end" />
          )}
        </button>
      </div>
    </div>
  );
}
