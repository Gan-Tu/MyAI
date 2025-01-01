import { claimsSchema, entityCardSchema } from "@/lib/types";
import { type Prediction } from "replicate";
import { z } from "zod";

export type ImageSearchResult = {
  link: string,
  title: string,
  thumbnailWidth?: number,
  thumbnailHeight?: number,
  image?: {
    contextLink?: string;
  };
}

export type entityCardSchemaType = z.infer<typeof entityCardSchema>
export type claimsSchemaType = z.infer<typeof claimsSchema>

export type NavigationProps = {
  enableLogin?: boolean
  enableCredits?: boolean
}

export type LogInButtonProps = {
  logo: string;
  textColor: string;
  bgColor: string;
  buttonText: string;
  provider?: LoginOption;
  onClick: () => void
}

export type PredictOptions = {
  model: string;
  input: object;
  webhook?: string;
  webhook_events_filter?: WebhookEventType[];
  wait?: boolean | number;
}

export interface PredictionWithInput extends Prediction {
  input: {
    prompt?: string;
  };
}

export type VisionModelParameter = {
  name: string,
  displayName?: string,
  default: string,
  options: string[]
}