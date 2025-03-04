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

import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { query } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Research Report - MyAI",
  description: "The final report of your research",
};

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  if (!sessionId) {
    return redirect("/research");
  }
  try {
    const res = await query(
      "SELECT final_report FROM DeepResearchReports WHERE session_id = $1",
      [sessionId],
    );
    if (res.rows.length === 0) {
      return redirect(`/research/${sessionId}`);
    }
    return (
      <div className="prose markdown-style place-content-center p-6">
        <Link
          href={`/research/${sessionId}`}
          className="my-4 flex items-center gap-2 text-blue-600 print:hidden"
        >
          Back to status page
        </Link>
        <MemoizedMarkdown id="report" content={res.rows[0].final_report} />
      </div>
    );
  } catch (error) {
    console.error(error);
    return redirect("/404");
  }
}
