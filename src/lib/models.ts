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
    creditsCost: number,
    parameters: VisionModelParameter[]
  }
} = {
  'AI Generated Emoji': {
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
  'Flux 1.1 Pro Ultra - High Res Photo': {
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