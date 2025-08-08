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

import { type ImageModelMetadata } from "@/lib/types";
import { anthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { fal } from '@ai-sdk/fal';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { mistral } from '@ai-sdk/mistral';
import { openai } from '@ai-sdk/openai';
import { replicate } from '@ai-sdk/replicate';
import { xai } from '@ai-sdk/xai';
import { ImageModel, LanguageModel } from 'ai';

export const defaultLanguageModel = 'openai/gpt-5-mini';

export const supportedLanguageModels = [
  'xai/grok-4',
  'xai/grok-3',
  'openai/gpt-5',
  'openai/gpt-5-mini',
  'google/gemini-2.5-flash',
  'mistral/ministral-3b',
  'anthropic/claude-3.7-sonnet',
  'anthropic/claude-3.5-haiku',
  'deepseek/deepseek-r1',
  'deepseek/deepseek-v3',
]

export const getLanguageModel = (model: string): LanguageModel => {
  if (!model) {
    throw new Error("Misisng model string");
  }
  if (!supportedLanguageModels.includes(model)) {
    throw Error(`Unsupported model: ${model}`)
  }
  if (model.startsWith('gpt') || model.startsWith('o')) {
    return openai(model)
  } else if (model.startsWith('gemini')) {
    return google(model)
  } else if (model.startsWith('llama')) {
    return groq(model)
  } else if (model.startsWith('grok')) {
    return xai(model)
  } else if (model.startsWith('ministral') || model.startsWith('mistral')) {
    return mistral(model)
  } else if (model.startsWith('deepseek')) {
    const deepseek = createDeepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY ?? '',
    });
    return deepseek(model)
  } else if (model.startsWith('claude')) {
    return anthropic(model, {
      cacheControl: true,
    })
  }
  throw Error(`Unsupported model: ${model}`)
}

export const getHighlightingModel = (): LanguageModel => {
  // return google('tunedModels/texthighlighter-c0uqcsiv5s5v')
  return openai("ft:gpt-4.1-mini-2025-04-14:personal:passage-highlight:BMma9d8r")
}

export const supportedImageModels: ImageModelMetadata[] = [
  {
    displayName: 'Stickers',
    provider: "replicate",
    model: 'fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a',
    creditsCost: 1,
    parameters: [
      {
        name: "output_format",
        options: ['png']
      }
    ]
  },
  {
    displayName: 'Emoji',
    provider: "replicate",
    model: 'fpsorg/emoji:2489b7892129c47ec8590fd3e86270b8804f2ff07faeae8c306342fad2f48df6',
    creditsCost: 1,
    aspectRatio: ['1:1', '16:9', '21:9', '3:2', '2:3', '4:5', '5:4', '3:4', '4:3', '9:16', '9:21'],
    parameters: [
      {
        name: "output_format",
        options: ['jpg', 'png']
      }
    ]
  },
  {
    displayName: 'Watercolor',
    provider: "replicate",
    model: 'lucataco/flux-watercolor:846d1eb37059ed2ed268ff8dd4aa1531487fcdc3425a7a44c2a0a10723ef8383',
    creditsCost: 5,
    promptSuffix: ' in the style of TOK',
    aspectRatio: ['1:1', '16:9', '21:9', '3:2', '2:3', '4:5', '5:4', '3:4', '4:3', '9:16', '9:21'],
    parameters: [
      {
        name: "output_format",
        options: ['png', 'jpg']
      }
    ]
  },

  {
    displayName: 'Google ImageGen 3 - Fast',
    provider: "replicate",
    model: 'google/imagen-3-fast',
    creditsCost: 2,
    aspectRatio: ['1:1', '9:16', '16:9', '3:4', '4:3'],
    parameters: [],
    defaultParameters: {
      "safety_filter_level": "block_only_high"
    }
  },
  {
    displayName: 'Google ImageGen 3 - High Quality',
    provider: "replicate",
    model: 'google/imagen-3',
    creditsCost: 5,
    aspectRatio: ['1:1', '9:16', '16:9', '3:4', '4:3'],
    parameters: [],
    defaultParameters: {
      "safety_filter_level": "block_only_high"
    }
  },
  {
    displayName: 'Minimax Image-01',
    provider: "replicate",
    model: 'minimax/image-01',
    creditsCost: 1,
    aspectRatio: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
    parameters: [
      {
        name: "prompt_optimizer",
        default: false
      }
    ]
  },
  {
    displayName: 'Recraft 20B',
    provider: "replicate",
    model: 'recraft-ai/recraft-20b',
    creditsCost: 5,
    parameters: [
      {
        name: "style",
        options: [
          'realistic_image',
          'realistic_image/b_and_w',
          'realistic_image/enterprise',
          'realistic_image/hard_flash',
          'realistic_image/hdr',
          'realistic_image/motion_blur',
          'realistic_image/natural_light',
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
  {
    displayName: 'Recraft V3 - Red Panda',
    provider: "replicate",
    model: 'recraft-ai/recraft-v3',
    creditsCost: 10,
    parameters: [
      {
        name: "style",
        options: [
          'any',
          'realistic_image',
          'digital_illustration',
          'digital_illustration/pixel_art',
          'digital_illustration/hand_drawn',
          'digital_illustration/grain',
          'digital_illustration/infantile_sketch',
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
  {
    displayName: 'Flux 1.1 Pro Ultra',
    provider: "replicate",
    model: 'black-forest-labs/flux-1.1-pro-ultra',
    creditsCost: 10,
    aspectRatio: ['1:1', '21:9', '16:9', '3:2', '4:3', '5:4', '1:11', '4:5', '3:4', '2:3', '9:16', '9:21'],
    parameters: []
  },
  {
    displayName: 'Cartoon iRobot',
    provider: "replicate",
    model: 'gan-tu/flux-cartoon-irobot:ad185cf288be3a9fdff1b2f4e82fd39e345c6dbc92493f8ddfad3973f97fd79f',
    promptPrefix: "Cartoon IROBOT ",
    creditsCost: 5,
    parameters: []
  },
  // {
  //   displayName: 'Signature Design',
  //   provider: "replicate",
  //   model: 'gan-tu/flux-dev-ai-signature:3699362ed9e98d32d05c7e99f747772960463dac9af70ebda3b98e69bd9f9b90',
  //   promptPrefix: "AISIGNATURE handwritten signature, black stylish calligraphy on white background. ",
  //   creditsCost: 5,
  //   parameters: []
  // },
  {
    displayName: 'Signature Design',
    provider: "fal",
    model: 'fal-ai/flux-lora',
    promptPrefix: "AISIGNATURE, thin stroke, curly, black stylish calligraphy on white background, handwritten signature: ",
    descriptionPlaceholder: "Enter your name first, then followed with optional description like your profession.",
    creditsCost: 5,
    parameters: [
      {
        name: "output_format",
        options: ['jpeg', 'png']
      }
    ],
    defaultParameters: {
      "loras": [
        {
          "path": "https://v3.fal.media/files/lion/OySNH55STXpyppPXSWNH8_pytorch_lora_weights.safetensors",
          "scale": 1
        }
      ],
      "guidance_scale": 5,
      "num_inference_steps": 50,
      "enable_safety_checker": false
    }
  },
  {
    displayName: 'Priapus God Cartoon',
    provider: "replicate",
    model: 'gan-tu/flux-priapus-cartoon:7a836d9f4003f20bd2fda5e5395a1afc1fcbf03efb5ac9bdbdb9a640fe55cb33',
    promptPrefix: "A photo of a cartoon muscular man PRIAPUS, ",
    creditsCost: 5,
    parameters: []
  },
  {
    displayName: 'Otake Cartoon Wolf',
    provider: "replicate",
    model: 'gan-tu/flux-otake-cartoon:088e3fb59c4814c0928d359e30ad212887be25ed6cf47050bdab3d9581d023b0',
    promptPrefix: "A cartoon wolf OTAKE with orange fur, ",
    creditsCost: 5,
    parameters: []
  }
];

export const getImageModelMetadata = (model: string): ImageModelMetadata | null => {
  let models = supportedImageModels.filter(
    (x) => x.displayName == model,
  );
  if (models.length > 0) {
    return models[0];
  }
  return null;
}

export const getImageModel = (model: string): ImageModel => {
  if (!model) {
    throw new Error("Misisng model string");
  }
  const metadata = getImageModelMetadata(model);
  if (!metadata) {
    throw Error(`Unsupported model: ${model}`)
  }
  if (metadata.provider == "replicate") {
    return replicate.image(metadata.model)
  } else if (metadata.provider == "fal") {
    return fal.image(metadata.model);
  }
  throw Error(`Unsupported model: ${model}`)
}
