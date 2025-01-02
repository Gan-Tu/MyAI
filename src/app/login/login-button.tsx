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

/* eslint-disable @next/next/no-img-element */
"use client";

import { type LogInButtonProps } from "@/lib/types";

export function LogInButton({
  logo,
  textColor,
  bgColor,
  buttonText,
  onClick,
}: LogInButtonProps) {
  return (
    <button
      className={`flex w-[300px] items-center justify-center gap-4 space-x-4 rounded-lg py-3 pl-14 text-justify text-sm font-medium hover:shadow-lg ${textColor} ${bgColor}`}
      onClick={onClick}
    >
      <img src={logo} className="h-5 w-5" alt="Logo" />
      <span className="flex-1 whitespace-nowrap">{buttonText}</span>
    </button>
  );
}
