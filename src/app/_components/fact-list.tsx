import { capElements } from "@/lib/utils";
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
  return (
    <div className={`grid grid-cols-2 gap-4 p-6 ${className}`}>
      {capElements(3, facts).map((fact, index) => (
        <Fact
          key={index}
          name={fact?.name}
          shortAnswer={fact?.short_answer}
          fullAnswer={fact?.full_answer}
          className={`${index === 2 ? "col-span-2" : "col-span-1"}`}
          // index === 0
          //   ? "bg-blue-100" // border border-blue-200
          //   : index === 1
          //   ? "bg-lime-100" // border border-green-200
          //   : "bg-amber-100" // border border-yellow-200
        />
      ))}
    </div>
  );
}
