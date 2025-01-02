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
