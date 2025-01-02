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

export function getAiTopicsRespCacheKey(str: string, model: string = 'gpt-4o-mini') {
  let modelStr = model === 'gpt-4o-mini' ? '' : `${model}:`
  return `ai-topics:resp:${modelStr}${str?.toLowerCase()?.trim()}`
}

export function getAiTopicsImagesCacheKey(str: string) {
  return `ai-topics:images:${str?.toLowerCase()?.trim()}`
}