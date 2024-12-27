import { capitalizeFirstLetter } from "@/lib/utils";
import Loader from "./loader";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="items-center p-5 min-w-[140px]">
      {title ? (
        <h1 className="text-lg font-bold text-gray-900">
          {capitalizeFirstLetter(title)}
        </h1>
      ) : (
        <Loader className="min-h-6 w-[160px] col-span-2" />
      )}
      {subtitle ? (
        <p className="text-sm text-gray-600">
          {capitalizeFirstLetter(subtitle)}
        </p>
      ) : !title ? (
        <Loader className="min-h-6 mt-1 w-[120px] col-span-2" />
      ) : null}
    </div>
  );
}
