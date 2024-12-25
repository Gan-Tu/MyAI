import Fact from "./fact";

interface Fact {
  name?: string;
  short_answer?: string;
  full_answer?: string;
}

interface FactsListProps {
  facts?: any[];
}

export default function FactsList({ facts }: FactsListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 border-t border-gray-200">
      {facts?.map((fact, index) => (
        <Fact
          key={index}
          name={fact.name}
          shortAnswer={fact.short_answer}
          fullAnswer={fact.full_answer}
          className={`p-4 rounded-lg ${
            index === 0
              ? "bg-blue-50 border border-blue-200"
              : index === 1
              ? "bg-green-50 border border-green-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        />
      ))}
    </div>
  );
}