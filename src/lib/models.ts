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

export const supportedVisionModels = [
  'recraft-ai/recraft-20b',
  'black-forest-labs/flux-1.1-pro-ultra'
]

export const getVisionModelExtraInputs = (model: string): VisionModelParameter[] => {
  if (!supportedVisionModels.includes(model)) {
    return []
  }
  if (model === 'recraft-ai/recraft-20b') {
    return [
      {
        name: "style",
        default: "digital_illustration",
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
  }
  return []
}