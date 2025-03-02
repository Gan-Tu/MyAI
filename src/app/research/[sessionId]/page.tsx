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

import { query } from "@/lib/db";
import { type DeepResearchSession } from "@/lib/types";
import { redirect } from "next/navigation";
import ResearchPage from "./research-page";

export const metadata = {
  title: "Research Status - MyAI",
  description: "Check status of your research session.",
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
      "SELECT * FROM DeepResearchSessions WHERE session_id = $1",
      [sessionId],
    );
    if (res.rows.length === 0) {
      return redirect("/404");
    }
    return (
      <div className="place-content-center p-6">
        <ResearchPage
          id={sessionId}
          data={res.rows[0] as DeepResearchSession}
        />
      </div>
    );
  } catch (error) {
    console.error(error);
    return redirect("/404");
  }
}
