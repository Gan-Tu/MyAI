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

import { supportedLanguageModels } from "@/lib/models";
import ResearchHome from "./research";

export const metadata = {
  title: "Deep Research",
  description:
    "Explore any subject in depth or review your past research. Start a new research journey with ease.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q, model: modelParam } = await searchParams;
  const query = Array.isArray(q) ? (q.length > 0 ? q[0] : undefined) : q;
  const model = Array.isArray(modelParam)
    ? modelParam.length > 0
      ? modelParam[0]
      : undefined
    : modelParam;
  let defaultModel: string | undefined = model || "grok-2-1212";
  if (!supportedLanguageModels.includes(defaultModel ?? "")) {
    defaultModel = undefined;
  }
  return (
    <div className="place-content-center p-6">
      <ResearchHome q={query} defaultModel={defaultModel} />
    </div>
  );
}
