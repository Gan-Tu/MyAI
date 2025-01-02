// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
