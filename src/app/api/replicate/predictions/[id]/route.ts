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

import { NextResponse } from "next/server";
import Replicate from "replicate";

export const fetchCache = 'force-no-store'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing required parameter 'id'" }, { status: 400 }
    );
  }
  const prediction = await replicate.predictions.get(id);
  if (prediction?.error) {
    return NextResponse.json({ error: prediction.error }, { status: 500 });
  }
  return NextResponse.json({ prediction });
}