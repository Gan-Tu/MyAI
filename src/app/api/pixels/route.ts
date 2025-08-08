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

import { getImageModel, getImageModelMetadata } from '@/lib/models';
import { checkRateLimit } from "@/lib/redis";
import { ImageModelMetadata } from '@/lib/types';
import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';
import { generateId, experimental_generateImage as generateImage, ImageModel, JSONValue } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const sql = neon(process.env.DATABASE_URL!);

interface RequestBodyType {
  prompt: string, modelName: string, options: Record<string, JSONValue>, userId: string
}

async function uploadImage(fileName: string, buffer: Buffer) {
  const blob = await put(`replicate-images/${fileName}`, buffer, {
    access: 'public',
  });
  return blob;
}

export async function POST(req: Request) {
  const { prompt, modelName, options, userId }: RequestBodyType = await req.json();

  let { passed, secondsLeft } = await checkRateLimit("/api/pixels")
  if (!passed) {
    return NextResponse.json({
      error: `Rate Limited. ${secondsLeft && `${secondsLeft}s left`}.`
    }, { status: 429 })
  }

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
  } else if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 })
  } else if (!modelName) {
    return NextResponse.json({ error: "modelName is required." }, { status: 400 })
  } else if (!options) {
    return NextResponse.json({ error: "options is required." }, { status: 400 })
  }

  let model = null;
  let modelSpec: ImageModelMetadata | null = null;
  try {
    model = getImageModel(modelName);
    modelSpec = getImageModelMetadata(modelName);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }

  if (!modelSpec || !model) {
    return NextResponse.json({ error: "Faield to initialize image model." }, { status: 400 })
  }

  let { aspectRatio, ...restOfOptions } = options;
  if (modelSpec.defaultParameters) {
    restOfOptions = {
      ...(restOfOptions || {}),
      ...modelSpec.defaultParameters
    }
  }
  let providerOptions = restOfOptions ? {
    [modelSpec.provider]: {
      ...restOfOptions,
    }
  } : undefined;
  console.log("providerOptions", providerOptions);

  try {
    const { image } = await generateImage({
      model: model,
      prompt: prompt,
      aspectRatio: (aspectRatio as `${number}:${number}`) || undefined,
      providerOptions: providerOptions
    });

    const fileExt = options.output_format || "webp";
    const fileName = `${generateId()}.${fileExt}`;
    const imageBuffer = Buffer.from(image.uint8Array);

    const blob = await uploadImage(fileName, imageBuffer);
    const result = {
      url: blob.url,
      pathname: blob.pathname,
      downloadUrl: blob.downloadUrl,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
    };

    await sql(`INSERT INTO PixelsImageGeneration (user_id, content_type, image_url, provider, model, prompt) VALUES ($1,$2,$3,$4,$5,$6)`, [userId, blob.contentType, blob.url, modelSpec.provider, modelSpec.model, prompt]);

    // const redisKey = `myai:replicate:${fileName}`;
    // await redis.json.set(redisKey, "$", {
    //   input: {
    //     modelName, prompt, aspectRatio, providerOptions
    //   },
    //   output: result
    // });
    // console.log(`Saved content to redis at: ${redisKey}`);

    return NextResponse.json(result, { status: 200 });

    // // Return the image using NextResponse
    // return new NextResponse(imageBuffer, {
    //   status: 200,
    //   headers: {
    //     "Content-Type": `image/${fileExt}`,
    //     "Content-Length": imageBuffer.length.toString(),
    //   },
    // });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: `Faield to generate and store the image: ${error}` }, { status: 500 }
    )
  }


}
