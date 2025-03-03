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

require("dotenv").config();

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function getSession(sessionId) {
  const res = await sql(
    "SELECT * FROM DeepResearchSessions WHERE session_id = $1",
    [sessionId],
  );
  return res ? res[0] : null;
}

async function updateSessionStatus(session_id, status) {
  await sql(
    "UPDATE DeepResearchSessions SET status = $1, updated_at = NOW() WHERE session_id = $2",
    [status, session_id],
  );
}

async function addSessionSummary(session_id, summary) {
  await sql(
    "UPDATE DeepResearchSessions SET summaries = summaries || $1::jsonb WHERE session_id = $2",
    [JSON.stringify(summary), session_id],
  );
}

async function createSearchQuery(session_id, query_text, step_number) {
  const res = await sql(
    "INSERT INTO DeepResearchSearchQueries (session_id, query_text, step_number) VALUES ($1, $2, $3) RETURNING query_id",
    [session_id, query_text, step_number],
  );
  return res[0].query_id;
}

async function createSearchResult(query_id, url, title, snippet, full_content) {
  const res = await sql(
    "INSERT INTO DeepResearchSearchResults (query_id, url, title, snippet, full_content) VALUES ($1, $2, $3, $4, $5) RETURNING result_id",
    [query_id, url, title, snippet, full_content],
  );
  return res[0].result_id;
}

// console.log("Fetching search results for current step");
// let d = await db.getSearchResultsForStep(sessionId, currentStep);
// for (const r of d) {
//   knowledgeResults.push({
//     query: r.query_text,
//     url: r.url,
//     title: r.title,
//     snippet: r.snippet,
//     fullContent: r.full_content,
//   });
// }
async function getSearchResultsForStep(session_id, step_number) {
  const res = await sql(
    `
    SELECT 
        drsr.url,
        drsr.title,
        drsr.snippet,
        drsr.full_content,
        drsq.query_text
    FROM 
        DeepResearchSearchResults drsr
    JOIN 
        DeepResearchSearchQueries drsq
        ON drsr.query_id = drsq.query_id
    WHERE 
        drsq.session_id = $1
        AND drsq.step_number = $2
    `,
    [session_id, step_number],
  );
  return res;
}

async function createKnowledgeEntry(session_id, step_number, content, sources) {
  const res = await sql(
    "INSERT INTO DeepResearchKnowledgeBase (session_id, step_number, content, sources) VALUES ($1, $2, $3, $4) RETURNING knowledge_id",
    [session_id, step_number, content, JSON.stringify(sources)],
  );
  return res[0].knowledge_id;
}

async function getKnowledgeSummary(session_id) {
  const res = await sql(
    "SELECT content, sources FROM DeepResearchKnowledgeBase WHERE session_id = $1",
    [session_id],
  );
  return res
    .map((row) => {
      let result = `${row.content}\n\n`;
      for (const source of row.sources) {
        result += `[${source.sourceIndex}] ${source.url}\n`;
      }
      return result.trim();
    })
    .join("\n\n");
}

async function addReport(session_id, report) {
  const res = await sql(
    "INSERT INTO DeepResearchReports (session_id, final_report) VALUES ($1, $2) RETURNING report_id",
    [session_id, report],
  );
  return res[0].report_id;
}

async function getReport(session_id) {
  // TODO: this is not updated
  const res = await sql(
    "SELECT * FROM DeepResearchReports WHERE session_id = $1",
    [session_id],
  );
  return res[0];
}

module.exports = {
  getSession,
  updateSessionStatus,
  addSessionSummary,
  createSearchQuery,
  createSearchResult,
  getSearchResultsForStep,
  createKnowledgeEntry,
  getKnowledgeSummary,
  addReport,
  getReport,
};
