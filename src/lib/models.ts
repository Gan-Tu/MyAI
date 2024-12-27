import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

export const supportedModels = [
  'gpt-4o-mini',
  'gemini-1.5-flash',
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
  }
  throw Error(`Unsupported model: ${model}`)
}