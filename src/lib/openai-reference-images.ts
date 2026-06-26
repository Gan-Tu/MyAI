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

type ReferenceImage = {
  dataUrl: string;
  name?: string;
};

function collectOutputText(value: unknown, text: string[] = []) {
  if (!value || typeof value !== "object") return text;

  if (Array.isArray(value)) {
    for (const item of value) collectOutputText(item, text);
    return text;
  }

  const item = value as Record<string, unknown>;
  if (item.type === "output_text" && typeof item.text === "string") {
    text.push(item.text);
  }

  for (const child of Object.values(item)) {
    collectOutputText(child, text);
  }

  return text;
}

function createReferenceImagePrompt(prompt: string, referenceImages: ReferenceImage[]) {
  const imageNames = referenceImages
    .map((image) => image.name)
    .filter(Boolean)
    .join(", ");

  return `
You are analyzing uploaded reference images for an @tugan/widgets generator.

The final output will be a compact chat widget, usually a Card around 400px wide
and never wider than 600px. The generator can use declarative Widget UI
components such as Card, Row, Col, Box, Text, Title, Caption, Badge, Button,
Image, Avatar, Table, List, Each, Show, and form controls. It cannot use custom
CSS, arbitrary JavaScript, callbacks, or uploaded image data URLs in the final
widget data.

User prompt:
${prompt.trim()}

Reference image files:
${imageNames || "Unnamed uploaded images"}

Return concise, structured notes for the planner and final widget generator:
- User intent alignment: what kind of widget the images imply for this prompt.
- Layout and hierarchy: major regions, reading order, density, spacing, and what should be centered, stacked, grouped, or repeated.
- Visual style: color palette, tone, radius, borders, shadows, typography scale, and whether the widget should feel plain, polished, dense, playful, editorial, etc.
- Widget components: likely @tugan/widgets primitives to mirror, such as Card, Row, Col, Image, Badge, Table, Button, Progress, List, or form controls.
- Content cues: visible labels or values that are safe and relevant to mirror.
- Image/media guidance: where real image URLs would help the final widget and what concrete subjects those image searches should target.
- Customer/contact guidance: whether the reference implies a customer profile, checkout contact block, delivery details, account owner, or similar demo fields.
- Avoid: visual clutter, unsupported UI patterns, real privacy-sensitive details, or anything that would not fit a narrow compact widget.

Privacy and safety:
- Do not include uploaded image data URLs.
- Do not transcribe or expose real personal contact details, payment details, private addresses, or unique identifiers from the uploaded images.
- You may say that the final widget should use synthetic demo customer/contact placeholders such as a fake name, example.com email, 555 phone number, or generic address when that would match the layout.
- Do not invent facts outside what the prompt or reference images support.

Do not create the final widget. Do not include markdown fences. Keep the notes short but specific.
`.trim();
}

export async function analyzeWidgetReferenceImages(
  prompt: string,
  referenceImages: ReferenceImage[],
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.5",
      reasoning: { effort: "high" },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: createReferenceImagePrompt(prompt, referenceImages),
            },
            ...referenceImages.map((image) => ({
              type: "input_image",
              image_url: image.dataUrl,
              detail: "low",
            })),
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Error analyzing reference images: ${response.status} ${errorBody}`,
    );
  }

  const body = await response.json();
  return collectOutputText(body).join("\n").trim();
}
