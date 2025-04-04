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

import { z } from "zod";

export const entityCardSchema = z.object({
  title: z.string().describe("A brief, informative phrase (under 40 characters) representing the main topic of the user query."),
  subtitle: z.string().describe("A short phrase (under 5 words) that categorize or further describe the title."),
  video: z.object({
    name: z.string().describe("Optinoal video title to include"),
    url: z.string().describe("The url for the video chosen, if one is chosen")
  }),
  description: z.string().describe("One or two paragraphs (40-80 words per paragraph) summarizing the topic's key attributes."),
  highlighting: z.string().describe("A short consecutive substring (3-5 words) from the description paragraph highlighting the most important attribute or topic of the description. The highlighted phrase should be exactly as it occured in the description."),
  facts: z.array(
    z.object({
      name: z.string().describe("1-3 words, unique, and succinctly represents the fact"),
      full_answer: z.string().describe("20-40 words of the full fact"),
      short_answer: z.string().describe("Under 10-word summary for the fact"),
    })
  ).describe("At most 3 salient facts about the topic."),
});


export const claimsSchema = z.object({
  facts: z.array(
    z.string().describe("A single factoid claim")
  ).describe("A list of indiviual factoid sentences.")
})

export const citationNeedsClassficationSchema = z.object({
  classifications: z.array(
    z.object({
      sentence: z.string().describe("The sentence being examined"),
      verdict: z.string().describe("The verdict on what type of citation is needed"),
      reason: z.string().describe("Reason for the classification of this sentence"),
    })
  )
})
