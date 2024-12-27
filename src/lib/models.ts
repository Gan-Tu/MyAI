import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

export const supportedModels = [
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
  if (!supportedModels.includes(model)) {
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