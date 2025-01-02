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

import bing_search from '@/lib/agents';
import { getLanguageModel } from '@/lib/models';
import redis, { checkRateLimit } from "@/lib/redis";
import { entityCardSchema } from '@/lib/schema';
import { getAiTopicsRespCacheKey } from "@/lib/utils";
import { LanguageModel, streamObject } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
IyBUb3BpYyBDYXJkIEdlbmVyYXRpb24KCkZvbGxvdyB0aGVzZSBydWxlcyBwcmVjaXNlbHkuIFJ1bGVzIHdpdGggY2FwaXRhbGl6ZWQgaW5zdHJ1Y3Rpb25zIGFyZSBtYW5kYXRvcnkuIEZvbGxvdyB3b3JkIGFuZCBjaGFyYWN0ZXJzIGNvdW50IGluc3RydWN0aW9ucyBzdHJpY3RseSwgdW5sZXNzIGl0IHdpbGwgZGVncmFkZSB0aGUgY2xhcml0eSBvZiB0b3BpYyBjYXJkIHNpZ25pZmljYW50bHkuCgpHZW5lcmF0ZSBhIGluZm9ybWF0aXZlLCBnbGFuY2VhYmxlLCBrbm93bGVkZ2UgdG9waWMgY2FyZCBiYXNlZCBvbiBhIHVzZXIgcXVlcnkgd2l0aCB0aGVzZSBjb21wb25lbnRzOgoKKiAqKlRpdGxlOioqIEJyaWVmLCBpbmZvcm1hdGl2ZSBub3VuIHBocmFzZSByZXByZXNlbnRpbmcgbWFpbiBlbnRpdHkgY29uY2VwdC4gVW5kZXIgNDAgY2hhcmFjdGVycy4KICAqIERvIE5PVCB1c2UgZ2VuZXJpYyBub3VucyBhbmQvb3IgYWRqZWN0aXZlcy4gKE5vIHRlcm1zIGxpa2UgIm92ZXJ2aWV3IiwgImV4cGxhaW5lZCIsICJkZXRhaWxzIikKICAqIElmIHVzZXIgcXVlcnkgaXMgYW5zd2VyIHNlZWtpbmcgYW5kIHRoZSBhbnN3ZXIgaGFzIGV4YWN0bHkgb25lIGNsZWFyIGFuZCBkaXN0aW5jdCBlbnRpdHkuIFVzZSB0aGUgZW50aXR5IG5hbWUgYXMgdGl0bGUuIEZvciBleGFtcGxlLCBpZiB1c2VyIHF1ZXJ5IGlzICJBZGFtIHdpZmUiIGFuZCB0aGUgZGVzY3JpcHRpb24gaXMgYWJvdXQgIk9saXZpYSIsIHVzZSAiT2xpdmlhIiBhcyB0aXRsZS4gSWYgdGhlIGFuc3dlciBjb250YWlucyBtdWx0aXBsZSBlbnRpdGllcywgZG8gTk9UIGRvIHRoaXMuCiAgKiBJZiBkZXNjcmlwdGlvbiBpcyBhYm91dCBmb29kIGFuZCBkcmluayByZWNpcGUsIGRvIE5PVCB1c2Ugd29yZHMgbGlrZSAicmVjaXBlIiBhbmQgImluZ3JlZGllbnRzIiBhcyB0aXRsZQoqICoqU3VidGl0bGU6KiogUHJlZmVyZWQgYnV0IG9wdGlvbmFsLiBVbmRlciA1IHdvcmRzLgogICogTVVTVCBhZGRzIHZhbHVlIHRvIHRpdGxlLiBCZSBvYmplY3RpdmUsIGF2b2lkcyB2ZXJicyBvciBzdWJqZWN0aXZlIHRlcm1zLgogICogSWYgdG9waWMgaXMgYWJvdXQgYW4gZW50aXR5LCBQUkVGRVIgdXNpbmcgZW50aXR5IGNhdGVnb3J5IGFzIHN1YnRpdGxlLiBFeGFtcGxlIGVudGl0eSBjYXRlZ29yaWVzIGluY2x1ZGUgYnV0IE5PVCBsaW1pdGVkIHRvICJnb3Zlcm5tZW50IHJlZ3VsYXRpb24iLCAidXBjb21pbmcgbW92aWUiLCAidHYgc2hvd3MiLCAiYW1lcmljYW4gc2luZ2VyIiwgInRpa3RvayBpbmZsdWVuY2VyIiwgZXRjLgogICogVXNlIG9ubHkgY29tbW9uIG5vdW5zIGFuZC9vciBhZGplY3RpdmVzLiBObyB2ZXJicywgYWR2ZXJicywgcHJvbm91bnMsIG9yIGNvbXBsZXgvdW5mYW1pbGlhciB0ZXJtcy4KICAqIFRoZSBzdWJ0aXRsZSBtdXN0IGJlIG5vbi1qdWRnbWVudGFsIGFuZCBvYmplY3RpdmUuIE5PIHN1YmplY3RpdmUgd29yZHMgc3VjaCBhcyAiaGVhbHRoeSIsICJnb29kIiwgImJlYXV0aWZ1bCIsICJuaWNlIiwgImRhbmdlcm91cyIgZXRjLiwgYXMgd2VsbCBhcyBhbnkgcG90ZW50aWFsbHkgaGFybWZ1bCBvciBvZmZlbnNpdmUgbGFuZ3VhZ2UuCiAgKiBJZiBubyBzdWl0YWJsZSBzdWJ0aXRsZSBleGlzdHMgb3IgdmlvbGF0ZXMgYW55IG9mIHRoZXNlIHJ1bGVzLCBsZWF2ZSB0aGUgc3VidGl0bGUgZmllbGQgZW1wdHkuCiogKipEZXNjcmlwdGlvbjoqKiBPbmUgb3IgdHdvIHBhcmFncmFwaHMuIFVuZGVyIDQwLTgwIHdvcmRzIGluIHRvdGFsLiBTdW1tYXJpemUgdGhlIHRvcGljJ3Mga2V5IGF0dHJpYnV0ZXMuCiogKipIaWdobGlnaHRpbmc6KiogMy01IGNvbnNlY3V0aXZlIHdvcmRzIGZyb20gdGhlIGRlc2NyaXB0aW9uIGVtcGhhc2l6aW5nIGEga2V5IHBvaW50LiBFeGFjdCBtYXRjaCBvZiBhbnkgZGVzY3JpcHRpb24gc3Vic3RyaW5nLCBub3Qgc2ltaWxhciB0byB0aXRsZS9xdWVyeS4KKiAqKkZhY3RzOioqIE9wdGlvbmFsLiBVcCB0byAzIHN1Y2NpbmN0LCB1bmlxdWUgZmFjdHMgYWJvdXQgdGhlIHRvcGljLgogICogKipOYW1lOioqIERlY2xhcmF0aXZlIHBocmFzZXMgb3Iga2V5d29yZHMuIDEtMyB3b3Jkcy4gRWFzeSB0byB1bmRlcnN0YW5kLgogICAgKiBBdm9pZCBpbmNsdWRpbmcgdGhlIHByaW1hcnkgYW5kIHNlY29uZGFyeSBzdWJqZWN0cyBvZiB0aGUgcXVlcnkuCiAgICAgICAgKiAqKkV4YW1wbGUgMToqKiAKICAgICAgICAgICAgKiAqKlVzZXIgUXVlcnk6KiogIkhJSVQgZXhlcmNpc2VzIgogICAgICAgICAgICAqICoqR29vZDoqKiAiQmVuZWZpdHMiIAogICAgICAgICAgICAqICoqQmFkOioqICAiQmVuZWZpdHMgb2YgSElJVCIgKGluY2x1ZGVzIHRoZSBxdWVyeSBzdWJqZWN0ICJISUlUIikKICAgICAgICAqICoqRXhhbXBsZSAyOioqCiAgICAgICAgICAgICogKipVc2VyIFF1ZXJ5OioqICJTcGFjZVgiCiAgICAgICAgICAgICogKipHb29kOioqICJNaXNzaW9ucyIKICAgICAgICAgICAgKiAqKkJhZDoqKiAiU3BhY2VYIE1pc3Npb25zIiAoaW5jbHVkZXMgdGhlIHF1ZXJ5IHN1YmplY3QgIlNwYWNlWCIpIAogICAgKiBEbyBOT1QgdXNlIHF1ZXN0aW9uIGZvcm1hdC4gRmFjdCBuYW1lcyBzaG91bGQgYmUgZGVjbGFyYXRpdmUgcGhyYXNlcyBvciBrZXl3b3Jkcy4KICAgICAgICAqICoqR29vZDoqKiAgIkxlbmd0aCwiICJCZW5lZml0cyIsICJDYXVzZXMiCiAgICAgICAgKiAqKkJhZDoqKiAiV2hhdCBpcyB0aGUgbGVuZ3RoPyIsICJXaGF0IGFyZSB0aGUgYmVuZWZpdHM/IiwgIldoYXQgY2F1c2VzLi4uPyIKICAgICogRmFjdHMgc2hvdWxkIGJlIHVuaXF1ZSBmcm9tIGVhY2ggb3RoZXIgaW4gY29udGVudC4KICAqICoqU2hvcnQgQW5zd2VyOioqIDEtMjAgd29yZHMuIENvbmNpc2UsIHVuYW1iaWd1b3VzIHN1bW1hcnkuIE5vdCB2YWd1ZS4KICAgICogSWYgZmFjdCBpcyBhIHNpbmdsZSwgc2hvcnQgZmFjdHVhbCBhbnN3ZXIsIHVzZSAxLTMgd29yZHMuIAogICAgKiBJZiBmYWN0IGlzIGEgbGlzdCBhbnN3ZXIsIHVzZSBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGFsbCB0aGUgZW50aXRpZXMgbWVudGlvbmVkLiBEbyBOT1Qgc3VtbWFyaXplIGxpc3QgYW5zd2VycyB3aXRoIGEgc2luZ2xlIG51bWVyaWMgZmFjdCwgc3VjaCBhcyAidHdvIGRhdWdodGVycyIuCiAgICAqIElmIGZhY3QgaXMgYSBsb25nIGFuc3dlciwgYW5kIG5vdCBzdWl0YWJsZSBhcyBlaXRoZXIgc2hvcnQgYW5zd2VyIG9yIGxpc3QgYW5zd2VyLCB3cml0ZSBhIHNob3J0IHN1bW1hcnkgb2YgdGhlIGZ1bGwgYW5zd2VyLiAKICAgICAgICAqICoqR29vZDoqKiAgIkVmZmVjdGl2ZSB3aGVuIGRvbmUgcmVndWxhcmx5LiIsICJCbGVuZGluZyBjb2xvcnMgZm9yIGdyYWRpZW50IGVmZmVjdHMuIgogICAgICAgICogKipCYWQ6KiogIkVmZmVjdGl2ZSIsICJCbGVuZGluZyIKICAqICoqRnVsbCBBbnN3ZXI6KiogMjAtNDAgd29yZHMsIGZvcm1hdHRlZCBwcm9wZXJseS4KICAgICogSWYgZmFjdCBpcyBhIHNpbmdsZSwgc2hvcnQgZmFjdHVhbCBhbnN3ZXIsIGJvbGQgaXQgaW4gdGhlIGxvbmcgZm9ybSBhbnN3ZXIgYXMgd2VsbC4KICAgICogSWYgZmFjdCBpcyBhIGxpc3QgYW5zd2VyLCBtdXN0IHVzZSBidWxsZXRlZCBsaXN0IGl0ZW1zIHdpdGggKipib2xkKiogZm9ybWF0dGluZyBhbmQgaXRlbSBjb250ZXh0LgogICAgKiBGdWxsIGFuc3dlciBzaG91bGQgbWVudGlvbiB0aGUgc2hvcnQgYW5zd2VyIHVzZWQgYXMgd2VsbCBmb3IgY29uc2lzdGVuY3kuCiAgKiBXaGVuIG91dHB1dGluZyBmYWN0cywgb3JkZXIgZmFjdCB3aXRoIGxvbmdlc3Qgc2hvcnQgYW5zd2VyIGFhIHRoZSBsYXN0IGZhY3QuCiAgKiBQUkVGRVIgb3V0cHV0aW5nIG51bWVyaWNhbCBmYWN0cywgYnV0IG9ubHkgaWYgdGhleSBhcmUgaGlnaGdseSBmYWN0dWFsLCBvciBncm91bmRlZCBpbiBoZSBnaXZlbiB3ZWIgc25pcHBldHMuCiAgKiBGb3IgZXhlcmNpc2VzLCBwcmVmZXIgZ2VuZXJhdGluZyBmYWN0cyBsaWtlICJtdXNjbGVzIHdvcmtlZCIuIEZvciBzcG9ydHMgcXVlcmllcywgcHJlZmVyIG91dHB1dHRpbmcgbW9zdCByZWxldmFudCBzdGF0aXN0aWMgb3IgY2F0ZWdvcml6YXRpb24gZm9yIHRoZSBzcG9ydC4KICAqIFBSRUZFUiBvdXRwdXR0aW5nIG9uZSBzaG9ydCBmYWN0LCBvbmUgbGlzdHkgZmFjdCwgb25lIGxvbmcgZmFjdCwgd2hlbmV2ZXIgcG9zc2libGUuCiogKipWaWRlbyoqIE9wdGlvbmFsLiAKICAqIE9OTFkgc2VsZWN0IHZpZGVvcyB0aGF0IGFyZSBpbnN0cnVjdGlvbmFsLCBvciBhZGRzIHNpZ25pZmljYW50IHZhbHVlLCBmcm9tIHByb3ZpZGVkIGNhbmRpZGF0ZXMgc2VjdGlvbi4gCiAgKiBJZiBjYW5kaWRhdGVzIHNlY3Rpb24gaXMgZW1wdHksIGRvIG5vdCBzZWxlY3QgYW55LgogICogRG8gTk9UIHNlbGVjdCBhIHZpZGVvIGZvciBzdGF0aWMgb3IgY29udGV4dC1yaWNoIHRvcGljcyBiZXN0IHVuZGVyc3Rvb2QgdmlhIHRleHQuCiAgKiBQcmVmZXIgc2VsZWN0aW5nIGEgdmlkZW8gZm9yIG1lZGlhIHRvcGljcywgc3VjaCBhcyBtdXNpYywgdHYsIG1vdmllcywgZXRjLgogICogRG8gTk9UIHNlbGVjdCB2aWRlb3MgYWJvdXQgbmV3c3kgZXZlbnRzLCBzdWNoIGFzIGxlZ2FsIGNhc2VzLgoKIyMgT3V0cHV0IEZvcm1hdDoKCiogQXZvaWQgdXNpbmcgdW5pY29kZSBjaGFyYWN0ZXJzLgoqIEF2b2lkIGJhY2tzbGFzaGVzIGJlZm9yZSBkb2xsYXIgc2lnbiAiJCIuCiogVXNlIHByb3ZpZGVkIHRvZGF5J3MgZGF0ZSBhcyBjb250ZXh0IHRvIHJld29yZCByZXNwb25zZS4gQXZvaWQgZm9yd2FyZCBsb29raW5nIHRlcm1zICgidG9tb3Jyb3ciLCAibmV4dCB3ZWVrIiwgInVwY29taW5nIiwgZXRjLikgZm9yIGV2ZW50cyB0aGF0IGhhcyBoYXBwZW5lZC4=
`

const extractVideoSrcWithoutAutoplay = (embedHtml: string) => {
    const regex = /src="([^"]+)"/; // Regular expression to extract the src attribute
    const match = embedHtml.match(regex);

    if (match && match[1]) {
        let src = match[1];

        // Convert http to https if necessary
        if (src.startsWith('http://')) {
            src = src.replace('http://', 'https://');
        }

        // Remove the autoplay parameter if it exists
        const url = new URL(src);
        url.searchParams.delete('autoplay');
        return url.toString();
    }

    return null; // Return null if src is not found
};

function getTodayStr() {
    let today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


export async function POST(req: Request) {
    const context = await req.json();
    const headers = req.headers;
    const modelChoice = headers.get('X-AI-Model') || 'gpt-4o-mini'

    let { passed, secondsLeft } = await checkRateLimit("/api/ai-topics")
    if (!passed) {
        return NextResponse.json({
            error: `Rate Limited. ${secondsLeft && `${secondsLeft}s left`}.`
        }, { status: 429 })
    }

    let model: LanguageModel | null = null;
    try {
        model = getLanguageModel(modelChoice)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 400 })
    }

    let prompt = Buffer.from(systemPrompt.trim(), 'base64').toString('utf-8')
    try {
        let searchResults = await bing_search(context, 10);
        if (searchResults.videos) {
            let videoList = ''
            searchResults.videos?.value?.forEach(result => {
                if (result.name && result.allowMobileEmbed && result.embedHtml?.includes("youtube")
                    && result.height <= result.width) {
                    videoList += `\n\nName: ${result.name}\nUrl: ${extractVideoSrcWithoutAutoplay(result.embedHtml)}`
                }
            });
            if (videoList) {
                prompt = `${prompt}\n\n## Video Candidates\n\n${videoList}`
            }
        }
        prompt = `${prompt}\n\n## Web Context\n\nUse the following web results snippets as context for the generation of both description and fact generation. Summarize snippets if they are useful:
        `
        searchResults.webPages?.value?.forEach(result => {
            if (result.snippet) {
                prompt += `\n\nTitle: ${result.name}\nSnippet: ${result.snippet}`
            }
        });

        prompt += `\n\nToday is ${getTodayStr()}`
    } catch (error) {
        console.error("Failed to get bing search results: ", error)
    }

    const result = await streamObject({
        model: model,
        schema: entityCardSchema,
        system: prompt,
        prompt: context,
        onFinish: async ({ object }) => {
            if (object && context) {
                await redis.set(getAiTopicsRespCacheKey(context, modelChoice), object)
            }
        },
    })
    return result.toTextStreamResponse({
        headers: {
            'X-RateLimit-Limit': ''
        }
    });
}