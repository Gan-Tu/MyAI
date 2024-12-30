import { claimsSchema, entityCardSchema } from "@/lib/types";
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
  showLogin?: boolean
}

export type LogInButtonProps = {
  logo: string;
  textColor: string;
  bgColor: string;
  buttonText: string;
  provider: string;
  onClick?: () => void;
}