import { openai } from "@ai-sdk/openai";
import { type LanguageModel } from "ai";

const OPENAI_MODEL_PREFIX = "openai/";

export function getLanguageModel(model: string): LanguageModel {
  if (model.startsWith(OPENAI_MODEL_PREFIX)) {
    return openai.responses(model.slice(OPENAI_MODEL_PREFIX.length));
  }

  return model;
}
