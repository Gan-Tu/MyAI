import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    if (!messages || messages?.length <= 0) {
      return new Response(JSON.stringify({ error: "Missing messages" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      // onChunk({ chunk }) {
      //   // implement your own logic here, e.g.:
      //   if (chunk.type === 'text-delta') {
      //     console.log(chunk.textDelta);
      //   }
      //   if (chunk.type === 'tool-call') {
      //     console.log('tool-call', JSON.stringify(chunk, null, 2));
      //   }
      //   if (chunk.type === 'tool-result') {
      //     console.log('tool-result', JSON.stringify(chunk, null, 2));
      //   }
      // },
      // onFinish({ text, finishReason, usage, response, toolCalls, toolResults }) {
      //   console.log("usage", usage)
      //   console.log("finishReason", finishReason)
      //   console.log("text", text)
      //   console.log("toolCalls", toolCalls)
      //   console.log("toolResults", toolResults)
      // },
      tools: {
        weather: tool({
          description: 'Get the weather in a location (fahrenheit)',
          parameters: z.object({
            location: z.string().describe('The location to get the weather for'),
          }),
          execute: async ({ location }) => {
            const temperature = Math.round(Math.random() * (90 - 32) + 32);
            return {
              location,
              temperature,
            };
          },
        }),
        convertFahrenheitToCelsius: tool({
          description: 'Convert a temperature in fahrenheit to celsius',
          parameters: z.object({
            temperature: z
              .number()
              .describe('The temperature in fahrenheit to convert'),
          }),
          execute: async ({ temperature }) => {
            const celsius = Math.round((temperature - 32) * (5 / 9));
            return {
              celsius,
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

