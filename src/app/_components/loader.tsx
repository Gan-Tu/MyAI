import { useColorTheme } from "@/hooks/color-theme";
import clsx from "clsx";
import { motion } from "motion/react";

interface DescriptionProps {
  className?: string;
}

export default function Loader({ className }: DescriptionProps) {
  const { colorTheme } = useColorTheme();
  return (
    <motion.div
      className={clsx(className, "animate-pulse rounded-xl", colorTheme)}
    />
  );
}
