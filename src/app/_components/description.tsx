import { useColorTheme } from "@/hooks/color-theme";
import { useResetExpansion } from "@/hooks/reset-expansion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
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
  className,
}: DescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { resetFlag } = useResetExpansion();
  const { colorTheme } = useColorTheme();

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
        <div className="inline space-y-1 text-sm text-gray-700">
          <Loader className="col-span-2 min-h-6 w-full" />
          <Loader className="col-span-2 min-h-6 w-full" />
          <Loader className="col-span-2 min-h-6 w-[200px]" />
        </div>
      </div>
    );
  }

  const [beforeHighlight, afterHighlight] =
    description && highlighting && description.includes(highlighting)
      ? [
          description.slice(0, description.indexOf(highlighting)),
          description.slice(
            description.indexOf(highlighting) + highlighting.length,
          ),
        ]
      : [description || "", ""];

  return (
    <div
      className={`relative p-5 pb-3 ${className} ${
        isExpanded ? "pb-[2rem]" : ""
      }`}
    >
      {/* Content container with smooth height transition */}
      <div className="relative">
        <div
          className="line-height-[1.5rem] overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: contentHeight ? `${contentHeight}px` : "7.5rem",
          }}
        >
          <div ref={contentRef}>
            {beforeHighlight}
            {highlighting && afterHighlight && (
              <span className={clsx("px-[0.15rem] font-semibold", colorTheme)}>
                {highlighting}
              </span>
            )}
            {afterHighlight}
          </div>
        </div>
        <button
          className={`absolute bottom-0 right-0 flex cursor-pointer items-center rounded-xl bg-slate-100 py-[0.15rem] pl-2 pr-1 text-center text-[0.8rem] backdrop-blur-md backdrop-opacity-15 transition-all duration-300 ease-in-out ${
            isExpanded ? "translate-y-[1.7rem]" : ""
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Less" : "More"}
          <ChevronDownIcon
            className={`h-4 w-4 justify-end transition-all duration-200 ease-in-out ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
