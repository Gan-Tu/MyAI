import { motion } from "motion/react";

interface DescriptionProps {
  className?: string;
}

export default function Loader({ className }: DescriptionProps) {
  return (
    <motion.div className={`${className} animate-pulse bg-blue-100 rounded`} />
  );
}
