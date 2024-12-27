import { useResetExpansion } from "@/hooks/reset-expansion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
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
  className
}: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { resetFlag } = useResetExpansion();

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (resetFlag) {
      setIsExpanded(false);
    }
  }, [resetFlag]);

  if (!description) {
    return (
      <div className="p-5">
        <div className="text-gray-700 text-sm inline space-y-1">
          <Loader className="min-h-6 w-full col-span-2" />
          <Loader className="min-h-6 w-full col-span-2" />
          <Loader className="min-h-6 w-[200px] col-span-2" />
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
    <div
      className={`p-5 pb-3 relative ${className} ${
        isExpanded ? "pb-[2rem]" : ""
      }`}
    >
      {/* Content container with smooth height transition */}
      <div className="relative">
        <div
          className="transition-all duration-300 ease-in-out line-height-[1.5rem] overflow-hidden"
          style={{
            maxHeight: contentHeight ? `${contentHeight}px` : "7.5rem"
          }}
        >
          <div ref={contentRef}>
            {beforeHighlight}
            {highlighting && afterHighlight && (
              <span className="font-semibold bg-blue-100 px-[0.15rem]">
                {highlighting}
              </span>
            )}
            {afterHighlight}
          </div>
        </div>
        <button
          className={`absolute bottom-0 right-0 backdrop-blur-md backdrop-opacity-15 bg-slate-100 pl-2 pr-1  items-center  py-[0.15rem] cursor-pointer flex rounded-xl text-[0.8rem] text-center transition-all ease-in-out duration-300 ${
            isExpanded ? "translate-y-[1.7rem]" : ""
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Less" : "More"}
          <ChevronDownIcon
            className={`w-4 h-4 justify-end transition-all ease-in-out duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
