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

  if (!highlighting) {
    return (
      <div className="p-6">
        <div className="text-gray-700 text-sm inline">{description}</div>
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
          {" "}
          {highlighting}{" "}
        </span>
        {afterHighlight}
      </div>
    </div>
  );
}
