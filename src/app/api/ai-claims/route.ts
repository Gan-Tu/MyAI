import { getLanguageModel } from '@/lib/models';
import { claimsSchema } from '@/lib/schema';
import { LanguageModel, streamObject } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
You are an expert fact-checker at a newspaper. Your job is to identify each factoid in the Sentence. Then decontextualize each factoid and write the factoid as a standalone sentence that contains only that factoid.

=== Example 1 ===

User: can you give me some examples of science fiction movies?
Prefix: Sure! Here are some examples:

* Back to the Future (1985) directed by Robert Zemeckis.
* The Fly (1988) directed by David Cronenberg.

Sentence: * Interstellar (2014) directed by Christopher Nolan.

Rewritten facts from Sentence:
Fact: Interstellar is a science fiction movie.
Fact: Interstellar was released in 2014.
Fact: Christopher Nolan directed Interstellar.

=== Example 2 ===

User: What shows has Courtney Cox acted on?
Prefix: Courteney Cox has acted on a variety of shows over the years, including:

* Misfits of Science (1985): Cox starred as Gloria Dinallo in this short-lived NBC science fiction fantasy series.
* Family Ties (1987–1989): Cox had a recurring role as Lauren Miller.

Sentence: * Friends (1994–2004): Cox is best known for her role as Monica Geller in this NBC sitcom.

Rewritten facts from Sentence:
Fact: Courtney Cox acted on the TV show Friends.
Fact: Courtney Cox played the role of Monica Geller on Friends.
Fact: Friends aired from 1994 to 2004.
Fact: Friends is a sitcom.
Fact: Friends was produced by NBC.

=== Example 3 ===

User: Tell me about Charles Leclerc.
Prefix: Charles Leclerc is a Monégasque racing driver who currently races in Formula One for Scuderia Ferrari. He won the GP3 Series championship in 2016 and the FIA Formula 2 Championship in 2017. He made his Formula One debut in 2018 for Sauber, a team affiliated with Ferrari, for which he was part of the Ferrari Driver Academy.

Sentence: With Sauber having finished last the year before, Leclerc led the charge to improve its finishing position in the Constructors' Championship to eighth, and was the higher ranked of the two Sauber drivers.

Rewritten facts from Sentence:
Fact: Sauber finished last in the 2017 Formula One Constructors’ Championship.
Fact: In 2018, Charles Leclerc led the charge to improve Sauber's finishing position in the Constructors' Championship.
Fact: Sauber finished eighth in the 2018 Formula One Constructors’ Championship.
Fact: In 2018, Sauber had two drivers.
Fact: In 2018, Charles Leclerc was the higher ranked of two Sauber drivers.

=== Example 4 ===

User: Give me the steps to activate location preferences on the iphone.
Prefix: Sure, here are the steps on how to activate location preferences on your iPhone:

1. Open the Settings app.
2. Tap on Privacy.

Sentence: 3. Tap on Location Services.

Rewritten facts from Sentence:
Fact: The third step to activate location preferences on the iphone is to tap on Location Services.
Fact: Location Services is located in Privacy in the Settings app on the iphone.

=== Example 5 ===

User: What are good dietary sources of zinc?
Prefix: Zinc is an essential mineral that your body needs for many important functions, including:

* Immune system function
* Cell growth and division
* Wound healing * Metabolism
* Fertility
* Smell and taste

Zinc is not stored in the body, so it is important to get it from your diet on a regular basis. Good dietary sources of zinc include:

* **Meat:** Beef, lamb, pork, chicken, and turkey.
* **Seafood:** Oysters, crab, lobster, and shrimp.

Sentence: * **Legumes:** Beans, lentils, and peas.

Rewritten facts from Sentence:
Fact: Legumes are a good dietary source of zinc.
Fact: Beans are a good dietary source of zinc.
Fact: Lentils are a good dietary source of zinc.
Fact: Peas are a good dietary source of zinc.
Fact: Beans are legumes.
Fact: Lentils are legumes.
Fact: Peas are legumes.

=== Example 6 ===

User: who is nehru?
Prefix: Jawaharlal Nehru - Indian statesman and political leader. One of the most prominent political figures in the world, he was the leader of the left wing of the Indian national liberation movement. Under the mentorship of Mahatma Gandhi, Nehru became chairman of the Indian National Congress, and later, after the country gained independence on August 15, 1947, the first prime minister of India.

Sentence: He remained in this post until May 27, 1964, when he died of a heart attack.

Rewritten facts from Sentence:
Fact: Jawaharlal Nehru remained the prime minister of India until May 27, 1964.
Fact: Jawaharlal Nehru died of a heart attack.
Fact: Jawaharlal Nehru died on May 27, 1964.

=== Example 7 ===

User: tell me about sears
Prefix: Sears Holdings, based in Hoffman Estates, Illinois, lost $424 million, or $3.93 per share, in its first quarter. The West Duluth Kmart is the chain's last location in the Twin Ports area after the closure of stores in Duluth Heights and Superior. "It is going to be a big loss," said Loretta Olsen, who shops at both stores. "The stores are slowly closing and where am I going to go shopping. I don't want to shop online."

Sentence: Susan Coen, President of the West Duluth Business Club says it's going to impact the growth of the area as well.

Rewritten facts from Sentence:
Fact: Susan Coen is the President of the West Duluth Business Club.
Fact: According to Susan Coen, the closure of Kmart stores in Duluth Heights and Superior is going to impact the growth of the Duluth area.
`

export async function POST(req: Request) {
  const context = await req.json();
  const headers = req.headers;
  const modelChoice = headers.get('X-AI-Model') || 'gpt-4o-mini'

  let model: LanguageModel | null = null;
  try {
    model = getLanguageModel(modelChoice)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }

  const result = await streamObject({
    model: model,
    schema: claimsSchema,
    system: systemPrompt,
    prompt: context,
  })
  return result.toTextStreamResponse();
}