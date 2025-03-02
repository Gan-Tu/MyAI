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

import { citationNeedsClassficationSchema, claimsSchema, entityCardSchema } from "@/lib/types";
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
export type citationNeedsClassficationSchemaType = z.infer<typeof citationNeedsClassficationSchema>

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

export type ResearchSession = {
  id: string; // uuid
  user_id: string;
  topic: string;
  model: string;
  status: 'pending' | string; // Assuming 'pending' is the default, but could be other strings
  current_step: number;
  sub_topic_index: number;
  research_plan: any; // JSONB, could be more specific if known structure
  summaries: any; // JSONB, could be more specific if known structure
  final_report: string | null;
  error_message: string | null;
  progress: any; // JSONB array, assuming an array of objects
  processing: boolean;
  created_at: Date;
  updated_at: Date;
}

export type DeepResearchSessionStatus = {
  session_id: string; // uuid
  topic: string;
  model: string;
  status: 'pending' | string;
  created_at: Date;
}

export type ResearchSessionStatusEnum =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'canceled'
  | 'failed';

export type DeepResearchSessionSummary = {
  step: number;
  summary: string;
}

export type DeepResearchSession = {
  session_id: string;
  user_id: string;
  model: string;
  topic: string;
  status: ResearchSessionStatusEnum;
  error_message?: string | null;
  summaries: DeepResearchSessionSummary[];
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type DeepResearchSearchQuery = {
  query_id: string;
  session_id: string;
  step_number: number;
  query_text: string;
  summary: string;
  timestamp: string; // ISO timestamp
}

export type DeepResearchSearchResult = {
  result_id: string;
  query_id: string;
  url: string;
  title: string;
  snippet: string;
  full_content?: string | null;
}

export type DeepResearchKnowledgeBase = {
  knowledge_id: string;
  session_id: string;
  step_number: number;
  content: string;
  sources: string[]; // Array of URLs
}

export type DeepResearchReport = {
  report_id: string;
  session_id: string;
  final_report: string;
  citations: string[]; // Array of citation sources
}