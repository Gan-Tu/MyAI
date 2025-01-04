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

import { type VisionModelParameter } from "@/lib/types";
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

export const supportedLanguageModels = [
  'gpt-4o-mini',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'llama-3.1-8b-instant',
  'claude-3-5-haiku-20241022',
]

export const getLanguageModel = (model: string): LanguageModel => {
  if (!model) {
    throw new Error("Misisng model string");
  }
  if (!supportedLanguageModels.includes(model)) {
    throw Error(`Unsupported model: ${model}`)
  }
  if (model.startsWith('gpt')) {
    return openai(model)
  } else if (model.startsWith('gemini')) {
    return google(model)
  } else if (model.startsWith('llama')) {
    return groq(model)
  } else if (model.startsWith('claude')) {
    return anthropic(model, {
      cacheControl: true,
    })
  }
  throw Error(`Unsupported model: ${model}`)
}

export const VISION_MODELS: {
  [key: string]: {
    model?: string,
    version?: string,
    promptSuffix?: string,
    creditsCost: number,
    parameters: VisionModelParameter[]
  }
} = {
  'AI Stickers': {
    version: '4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a',
    creditsCost: 1,
    parameters: [
      {
        name: "output_format",
        displayName: "Output Format",
        default: "png",
        options: [
          'png',
        ]
      }
    ]
  },
  'AI Emoji': {
    version: '2489b7892129c47ec8590fd3e86270b8804f2ff07faeae8c306342fad2f48df6',
    creditsCost: 1,
    parameters: [
      {
        name: "aspect_ratio",
        displayName: "Aspect Ratio",
        default: "1:1",
        options: [
          '1:1',
          '16:9',
          '21:9',
          '3:2',
          '2:3',
          '4:5',
          '5:4',
          '3:4',
          '4:3',
          '9:16',
          '9:21',
        ]
      },
      {
        name: "output_format",
        displayName: "Output Format",
        default: "jpg",
        options: [
          'jpg',
          'png',
        ]
      }
    ]
  },
  'Flux - Watercolor': {
    version: '846d1eb37059ed2ed268ff8dd4aa1531487fcdc3425a7a44c2a0a10723ef8383',
    creditsCost: 5,
    promptSuffix: ' in the style of TOK',
    parameters: [
      {
        name: "aspect_ratio",
        displayName: "Aspect Ratio",
        default: "1:1",
        options: [
          '1:1',
          '16:9',
          '21:9',
          '3:2',
          '2:3',
          '4:5',
          '5:4',
          '3:4',
          '4:3',
          '9:16',
          '9:21',
        ]
      },
      {
        name: "output_format",
        displayName: "Output Format",
        default: "png",
        options: [
          'png',
          'jpg',
        ]
      }
    ]
  },
  'Recraft AI - Affordable & Fast Image': {
    model: 'recraft-ai/recraft-20b',
    creditsCost: 5,
    parameters: [
      {
        name: "style",
        displayName: "Style",
        default: "realistic_image",
        options: [
          'realistic_image',
          'realistic_image/b_and_w',
          'realistic_image/enterprise',
          'realistic_image/hard_flash',
          'realistic_image/hdr',
          'realistic_image/motion_blur',
          'realistic_image/natura_light',
          'realistic_image/studio_portrait',
          'digital_illustration',
          'digital_illustration/2d_art_poster',
          'digital_illustration/2d_art_poster_2',
          'digital_illustration/3d',
          'digital_illustration/80s',
          'digital_illustration/engraving_color',
          'digital_illustration/glow',
          'digital_illustration/grain',
          'digital_illustration/hand_drawn',
          'digital_illustration/hand_drawn_outline',
          'digital_illustration/handmade_3d',
          'digital_illustration/infantile_sketch',
          'digital_illustration/kawaii',
          'digital_illustration/pixel_art',
          'digital_illustration/psychedelic',
          'digital_illustration/seamless',
          'digital_illustration/voxel',
          'digital_illustration/watercolor',
        ]
      }
    ]
  },
  'Recraft AI - SOTA Image Generation': {
    model: 'recraft-ai/recraft-v3',
    creditsCost: 10,
    parameters: [
      {
        name: "style",
        displayName: "Style",
        default: "any",
        options: [
          'any',
          'realistic_image',
          'digital_illustration',
          'digital_illustration/pixel_art',
          'digital_illustration/hand_drawn',
          'digital_illustration/grain',
          'digital _illustration/infantile_sketch',
          'digital_illustration/2d_art_poster',
          'digital_illustration/handmade_3d',
          'digital_illustration/hand_drawn_out/',
          'digital_illustration/engraving_color',
          'digital_illustration/2d_art_poster_2',
          'realistic_image/b_and_w',
          'realistic_image/hard_flash',
          'realistic_image/hdr',
          'realistic_image/natural_light',
          'realistic_image/studio_portrait',
          'realistic_image/enterprise',
          'realistic_image/motion_blur',
        ]
      }
    ]
  },
  'Stable Diffusion - High Res Photo': {
    model: 'black-forest-labs/flux-1.1-pro-ultra',
    creditsCost: 10,
    parameters: [
      {
        name: "aspect_ratio",
        displayName: "Aspect Ratio",
        default: "1:1",
        options: [
          '21:9',
          '16:9',
          '3:2',
          '4:3',
          '5:4',
          '1:11',
          '4:5',
          '3:4',
          '2:3',
          '9:16',
          '9:21',
        ]
      }
    ]
  },
}