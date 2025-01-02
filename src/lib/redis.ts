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

import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv()

export default redis

const qps: number = Number(process.env.REDIS_RATE_LIMIT!) || 15
const window: string = process.env.REDIS_RATE_LIMIT_WINDOW! || "1 m"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(qps, window as Duration),
});

export async function checkRateLimit(identifier: string) {
  try {
    if (process.env.NODE_ENV === "development" || !ratelimit) {
      return { passed: true }
    }
    const result = await ratelimit.limit(identifier!);
    const msLeft = Math.abs(
      new Date(result.reset).getTime() - new Date().getTime()
    );
    return {
      passed: result.success,
      secondsLeft: Math.floor(msLeft / 1000)
    }
  } catch (error) {
    console.error(error)
    return { passed: false }
  }
}