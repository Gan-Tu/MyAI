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
      <div className="p-5">
        <div className="text-gray-700 text-sm inline space-y-1">
          <div className="min-h-6 w-full animate-pulse bg-slate-200 rounded col-span-2" />
          <div className="min-h-6 w-full animate-pulse bg-slate-200 rounded col-span-2" />
          <div className="min-h-6 w-[200px] animate-pulse bg-slate-200 rounded col-span-2" />
        </div>
      </div>
    );
  }

  const [beforeHighlight, afterHighlight] =
    description && highlighting && description.includes(highlighting)
      ? [
          description.slice(0, description.indexOf(highlighting)),
          description.slice(
            description.indexOf(highlighting) + highlighting.length
          )
        ]
      : [description || "", ""];

  return (
    <div className={`p-5 pb-3 relative ${className}`}>
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
              <span className="font-semibold bg-amber-100 px-[0.15rem]">
                {highlighting}
              </span>
            )}
            {afterHighlight}
          </p>
        </div>

        <button
          className="absolute bottom-0 right-0 backdrop-blur-md backdrop-opacity-15 bg-slate-100  pl-2  pr-1  py-[0.15rem] cursor-pointer flex rounded-xl text-[0.8rem] text-center transition-all ease-in-out duration-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Less" : "More"}
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 justify-end" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 justify-end" />
          )}
        </button>
      </div>
    </div>
  );
}
