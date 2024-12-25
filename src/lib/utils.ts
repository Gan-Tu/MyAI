import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return '' // Handle empty strings
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function capElements(count: number, arr?: any[]) {
  const topElemens = arr?.slice(0, count) || []; // Keep only the top 3 elements
  return topElemens.concat(Array(count - topElemens.length).fill(null)); // Fill with null if fewer than 3
};

export function getAiTopicsRespCacheKey(str: string) {
  return `ai-topics:resp:${str?.toLowerCase()?.trim()}`
}

export function getAiTopicsImagesCacheKey(str: string) {
  return `ai-topics:images:${str?.toLowerCase()?.trim()}`
}