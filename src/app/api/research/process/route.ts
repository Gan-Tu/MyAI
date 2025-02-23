import { query } from "@/lib/db";
import {
  compileReport,
  generatePlan,
  performSearch,
  summarizeFindings,
} from "@/lib/research";
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

async function triggerNextStep(id: number, origin: string, userId: string) {
  fetch(`${origin}/api/research/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "user-id": userId },
    body: JSON.stringify({ id }),
  }).catch((error) => console.error("Failed to trigger next step:", error));
}

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  const userId = request.headers.get("user-id");
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const res = await query(
    "SELECT * FROM research_sessions WHERE id = $1 AND status = $2 AND processing = false LIMIT 1 FOR UPDATE SKIP LOCKED",
    [id, "pending"],
  );
  if (res.rows.length === 0) {
    return NextResponse.json({
      message: "No pending session or already processing",
    });
  }
  const session = res.rows[0];

  try {
    let progress = session.progress || [];
    let shouldTriggerNext = false;
    let queries: { text: string; values: any[] }[] = [];

    if (session.current_step === 0) {
      const { subTopics, thoughts } = await generatePlan(session.topic);
      progress.push({ message: `Thinking about: ${thoughts}` });
      queries = [
        {
          text: "UPDATE research_sessions SET processing = true WHERE id = $1",
          values: [session.id],
        },
        {
          text: "UPDATE research_sessions SET research_plan = $1, current_step = 1, sub_topic_index = 0, progress = $2, processing = false WHERE id = $3",
          values: [
            JSON.stringify(subTopics),
            JSON.stringify(progress),
            session.id,
          ],
        },
      ];
      shouldTriggerNext = true;
    } else if (session.current_step === 1) {
      const subTopics = session.research_plan || [];
      const index = session.sub_topic_index;
      if (index < subTopics.length) {
        const subTopic = subTopics[index];
        const searchResults = await performSearch(subTopic);
        const { summary, needsMoreResearch } =
          await summarizeFindings(searchResults);
        const summaries = session.summaries || [];
        // Store needsMoreResearch with each summary
        summaries.push({ subTopic, summary, needsMoreResearch });
        progress.push({
          message: `Needs more research on: ${needsMoreResearch || "No additional research identified"}`,
        });

        queries = [
          {
            text: "UPDATE research_sessions SET processing = true WHERE id = $1",
            values: [session.id],
          },
          {
            text: "UPDATE research_sessions SET summaries = $1, sub_topic_index = $2, progress = $3, processing = false WHERE id = $4",
            values: [
              JSON.stringify(summaries),
              index + 1,
              JSON.stringify(progress),
              session.id,
            ],
          },
        ];
        shouldTriggerNext = true;
      } else {
        // Check all summaries for any non-empty needsMoreResearch
        const allSummaries = session.summaries || [];
        const moreResearchTopics = allSummaries
          .map(
            (s: {
              subTopic: string;
              summary: string;
              needsMoreResearch: string;
            }) => s.needsMoreResearch,
          )
          .filter((topic: string) => topic && topic.trim() !== "");

        if (moreResearchTopics.length > 0) {
          // Add all needsMoreResearch topics as new sub-topics
          const updatedSubTopics = [...moreResearchTopics];
          progress.push({
            message: `Adding new research topics: ${moreResearchTopics.join(", ")}`,
          });
          queries = [
            {
              text: "UPDATE research_sessions SET processing = true WHERE id = $1",
              values: [session.id],
            },
            {
              text: "UPDATE research_sessions SET research_plan = $1, sub_topic_index = 0, progress = $2, processing = false WHERE id = $3",
              values: [
                JSON.stringify(updatedSubTopics),
                JSON.stringify(progress),
                session.id,
              ],
            },
          ];
          shouldTriggerNext = true;
        } else {
          // Move to Step 2 only if no more research is needed
          queries = [
            {
              text: "UPDATE research_sessions SET processing = true WHERE id = $1",
              values: [session.id],
            },
            {
              text: "UPDATE research_sessions SET current_step = 2, processing = false WHERE id = $1",
              values: [session.id],
            },
          ];
          shouldTriggerNext = true;
        }
      }
    } else if (session.current_step === 2) {
      const summaries = session.summaries || [];
      const finalReport = await compileReport(session.topic, summaries);
      progress.push({ message: "Final report compiled" });
      queries = [
        {
          text: "UPDATE research_sessions SET processing = true WHERE id = $1",
          values: [session.id],
        },
        {
          text: "UPDATE research_sessions SET final_report = $1, status = $2, progress = $3, processing = false WHERE id = $4",
          values: [
            finalReport,
            "completed",
            JSON.stringify(progress),
            session.id,
          ],
        },
      ];
    }

    // Execute the transaction
    await sql.transaction(queries.map((q) => sql(q.text, q.values)));

    if (shouldTriggerNext) {
      triggerNextStep(session.id, request.nextUrl.origin, userId);
    }

    return NextResponse.json({
      message: `Processed step for session ${session.id}`,
    });
  } catch (error: any) {
    console.error(error);
    await query(
      "UPDATE research_sessions SET status = $1, error_message = $2, processing = false WHERE id = $3",
      ["error", error.message, session.id],
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
