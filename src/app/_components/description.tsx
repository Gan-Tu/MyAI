interface DescriptionProps {
  description?: string;
  highlighting?: string;
}

export default function Description({
  description,
  highlighting
}: DescriptionProps) {
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
    <div className="p-6">
      <div className="text-gray-700 text-sm inline">
        {beforeHighlight}
        <span className="font-semibold text-blue-600 inline">
          {highlighting}
        </span>
        {afterHighlight}
      </div>
    </div>
  );
}
