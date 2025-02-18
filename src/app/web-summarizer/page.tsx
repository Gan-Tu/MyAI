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

import { ResetExpansionProvider } from "@/hooks/reset-expansion";
import { supportedLanguageModels } from "@/lib/models";
import SummarizerPage from "./summarizer";

export const metadata = {
  title: "Web Summarizer",
  description:
    "Summarize any web page in seconds with Web Summarizer, the AI-powered tool that extracts the most important information from any URL. Get clear, concise summaries for quick review and understanding.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { model: modelParam } = await searchParams;
  const model = Array.isArray(modelParam)
    ? modelParam.length > 0
      ? modelParam[0]
      : undefined
    : modelParam;
  let defaultModel: string | undefined = model;
  if (!supportedLanguageModels.includes(defaultModel ?? "")) {
    defaultModel = undefined;
  }
  return (
    <ResetExpansionProvider>
      <div className="place-content-center p-6">
        <SummarizerPage defaultModel={defaultModel} />
      </div>
    </ResetExpansionProvider>
  );
}
