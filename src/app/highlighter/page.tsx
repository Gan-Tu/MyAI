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
import HighlighterPage from "./highlighter";

export const metadata = {
  title: "Text Highlighter",
  description:
    "Pinpoint key information in any text with Text Highlighter, the essential tool for marking important passages.  Save your highlighted sections for easy review and analysis.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? (q.length > 0 ? q[0] : undefined) : q;
  return (
    <ResetExpansionProvider>
      <div className="place-content-center p-6">
        <HighlighterPage q={query} />
      </div>
    </ResetExpansionProvider>
  );
}
