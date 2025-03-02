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

'use server'

import { query } from '@/lib/db';
import { type DeepResearchSession, type DeepResearchSessionStatus } from "@/lib/types";

export async function listSessions(userId: string): Promise<DeepResearchSessionStatus[]> {
  const res = await query(
    'SELECT session_id, topic, status, model, created_at FROM DeepResearchSessions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return res.rows as DeepResearchSessionStatus[];
}

export async function startSession(userId: string, topic: string, model: string): Promise<string> {
  const res = await query(`INSERT INTO DeepResearchSessions (user_id, topic, model) VALUES ($1, $2, $3) RETURNING session_id`, [userId, topic, model]);
  return res.rows[0].session_id;
}

export async function deleteSession(sessionId: string): Promise<DeepResearchSession | null> {
  const res = await query(
    'DELETE FROM DeepResearchSessions WHERE session_id = $1 RETURNING *', [sessionId]
  );
  if (res.rows.length === 0) {
    return null;
  }
  return res.rows[0] as DeepResearchSession;
}

export async function cancelSession(sessionId: string): Promise<DeepResearchSession | null> {
  const res = await query(
    'UPDATE DeepResearchSessions SET status = $1 WHERE session_id = $2', ["canceled", sessionId]
  );
  if (res.rows.length === 0) {
    return null;
  }
  return res.rows[0] as DeepResearchSession;
}