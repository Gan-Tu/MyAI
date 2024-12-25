import { entityCardSchema } from "@/lib/types";
import { z } from "zod";

export type ImageSearchResult = {
  link: string,
  title: string,
  thumbnailWidth?: number,
  thumbnailHeight?: number
}


export type entityCardSchemaType = z.infer<typeof entityCardSchema>