import { checkRateLimit } from '@/lib/redis';
import type { PutBlobResult } from '@vercel/blob';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// Define the expected request body type
interface RequestBody {
  text?: string;
  voice_id?: string;
  model_id?: string;
  output_format?: string;
}

export async function POST(request: Request) {
  let { passed, secondsLeft } = await checkRateLimit("/api/elevenlabs/text-to-speech")
  if (!passed) {
    return NextResponse.json({
      error: `Rate Limited. ${secondsLeft && `${secondsLeft}s left`}.`
    }, { status: 429 })
  }

  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Missing ElevenLabs API key in environment' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body: RequestBody = await request.json();
    let { text, voice_id, model_id, output_format } = body;
    if (!text) {
      return NextResponse.json(
        { error: 'Missing text in POST body' },
        { status: 400 }
      );
    } else if (output_format && !output_format.startsWith("mp3")) {
      return NextResponse.json(
        { error: `Output format ${output_format} is not supported. Currently only support mp3 formats` },
        { status: 400 }
      );
    }
    // Assign default values, if missing
    voice_id ||= "L0Dsvb3SLTyegXwtm47J" // Archer, British, Conversational
    model_id ||= "eleven_flash_v2_5"  // Multilingual, Cheaper
    output_format ||= "mp3_44100_128" // Default, mp3, 44.1kHz, sample rate at 128kbps

    // Call ElevenLabs API to generate audio
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({ text, model_id, output_format }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const error = await elevenLabsResponse.json();
      throw new Error(`ElevenLabs API error: ${JSON.stringify(error)}`);
    }

    // Get the audio buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    const filename = `${Date.now()}-${voice_id}.mp3`;

    // Upload to Vercel Blob
    const blob: PutBlobResult = await put(filename, audioBuffer, {
      access: 'public',
      contentType: `audio/mp3`,
    });

    // Return the blob URL and other metadata
    return NextResponse.json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      contentType: blob.contentType,
    });

  } catch (error) {
    console.error('Error in text-to-speech API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}