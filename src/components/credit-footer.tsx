import clsx from "clsx";
import Link from "next/link";

interface CreditFooterProps {
  className?: string;
  decorationColor?: string;
}

export default function CreditFooter({
  className,
  decorationColor,
}: CreditFooterProps) {
  return (
    <p
      className={clsx(
        "flex items-baseline gap-1 text-[0.8125rem]/6 text-gray-500",
        className,
        decorationColor || "decoration-sky-500/[.33]",
      )}
    >
      Brought to you by
      <Link
        href="https://tugan.me"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dashed underline-offset-4"
      >
        Gan Tu
      </Link>
    </p>
  );
}
