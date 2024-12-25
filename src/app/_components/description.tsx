interface DescriptionProps {
  description?: string;
  highlighting?: string;
}

export default function Description({
  description,
  highlighting
}: DescriptionProps) {
  if (!description) {
    return <></>;
  }

  const [beforeHighlight, afterHighlight] = description.split(
    highlighting || ""
  );

  return (
    <div className="p-6">
      <p className="text-gray-700 text-sm">
        {beforeHighlight}
        <span className="font-semibold text-blue-600">{highlighting}</span>
        {afterHighlight}
      </p>
    </div>
  );
}
