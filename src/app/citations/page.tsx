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
import CitationsPage from "./citations";

export const metadata = {
  title: "Citation Necessity",
  description:
    "Citation Necessity is an AI-driven tool for evaluating the citation needs of written text. Input any passage, and it categorizes each sentence based on whether it requires evidence, enhancing academic and professional rigor.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q, model: modelParam } = await searchParams;
  const model = Array.isArray(modelParam)
    ? modelParam.length > 0
      ? modelParam[0]
      : undefined
    : modelParam;
  const query = Array.isArray(q) ? (q.length > 0 ? q[0] : undefined) : q;
  let defaultModel: string | undefined = model;
  if (!supportedLanguageModels.includes(defaultModel ?? "")) {
    defaultModel = undefined;
  }
  return (
    <ResetExpansionProvider>
      <div className="place-content-center p-6">
        <CitationsPage q={query} defaultModel={defaultModel} />
      </div>
    </ResetExpansionProvider>
  );
}
