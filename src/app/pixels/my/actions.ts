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

"use server";

import { query } from "@/lib/db";
import { type ImageGalleryItem } from "@/lib/types";

export async function getImagesByUserId(userId: string) {
  if (!userId) {
    return []
  }
  const data = await query(
    "SELECT image_url, prompt, provider, model FROM PixelsImageGeneration WHERE user_id = $1",
    [userId]
  );
  let imageData: ImageGalleryItem[] = data.rows as ImageGalleryItem[];
  imageData.map(x => {
    if (x.provider === "replicate") {
      x.model_url = `https://replicate.com/${x.model.split(":")[0]}`
    }
  })
  return imageData;
}