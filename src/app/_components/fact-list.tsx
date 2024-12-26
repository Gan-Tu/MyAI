"use client";

import { useState } from "react";
import Fact from "./fact";

interface Fact {
  name?: string;
  short_answer?: string;
  full_answer?: string;
}

interface FactsListProps {
  facts?: any[];
  className?: string;
}

export default function FactsList({ facts = [], className }: FactsListProps) {
  const [isBlock1Expanded, setIsBlock1Expanded] = useState(false);
  const [isBlock2Expanded, setIsBlock2Expanded] = useState(false);
  const [isBlock3Expanded, setIsBlock3Expanded] = useState(false);
  const [block2First, setBlock2First] = useState(false);

  let block1 = (
    <Fact
      key={0}
      name={facts[0]?.name}
      shortAnswer={facts[0]?.short_answer}
      fullAnswer={facts[0]?.full_answer}
      className={`${
        isBlock1Expanded || isBlock2Expanded ? "col-span-full" : ""
      }`}
      isExpanded={isBlock1Expanded}
      setIsExpanded={(val) => {
        setIsBlock1Expanded(val);
        if (!val && !isBlock2Expanded) {
          setBlock2First(false);
        }
      }}
    />
  );

  let block2 = (
    <Fact
      key={1}
      name={facts[1]?.name}
      shortAnswer={facts[1]?.short_answer}
      fullAnswer={facts[1]?.full_answer}
      className={`${
        isBlock1Expanded || isBlock2Expanded ? "col-span-full" : ""
      }`}
      isExpanded={isBlock2Expanded}
      setIsExpanded={(val) => {
        setIsBlock2Expanded(val);
        if (val && !isBlock1Expanded) {
          setBlock2First(true);
        }
        if (!isBlock1Expanded && !val) {
          setBlock2First(false);
        }
      }}
    />
  );

  let block3 = (
    <Fact
      key={2}
      name={facts[2]?.name}
      shortAnswer={facts[2]?.short_answer}
      fullAnswer={facts[2]?.full_answer}
      className="col-span-full"
      isExpanded={isBlock3Expanded}
      setIsExpanded={setIsBlock3Expanded}
    />
  );

  return (
    <div className={`grid grid-cols-2 gap-4 p-5 ${className}`}>
      {block2First ? (
        <>
          {block2}
          {block1}
        </>
      ) : (
        <>
          {block1}
          {block2}
        </>
      )}
      {block3}
    </div>
  );
}
