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
