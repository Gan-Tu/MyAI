import { entityCardSchema } from "@/lib/types";
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