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
import { decrypt } from '@/lib/encryption';
import { getLanguageModel } from '@/lib/models';
import redis, { checkRateLimit } from "@/lib/redis";
import { entityCardSchema } from '@/lib/schema';
import { getAiTopicsRespCacheKey } from "@/lib/utils";
import { LanguageModel, streamObject } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = {
    "iv": "f83f92058061b78a27ab730f196058b2",
    "content": "6923c791be784304ff9bff55f623fe2c0f47b3a30e77bd4271d9d2c2f8fec3abea4fe760d0f6f8608d9eb331e44cd486c61a4400abb18ec8d30bc40449d31447a40cf98f38b05a71bc8c9eaf7efeeb1a10c7da7bf3d157a42f0d5fe8cbefa329055a0a8e758524376e8afc67d4ee0a9ab03aa6251eb18160c4e92c0ad463d06ef9f3b0c7891af18916547053fa2c407ba86d3993c5db3bd0cfe9f0f7383ef8f3e78fb1a2c5a4cf0095a6f33645663ece4a7a850ad5c024ddf20a619d3a34c119922aa6fcafb2d27a037c80aed8b63118c793e9c7ec117fcaacabe79dbb223e292fcb2c8409dc139a07684c6ff42939a0d68c1e0444f3558478b48c85e57945d37b9a0ca5977f7355254951c3b2f1e521402d0104041dcabc97d88f4301769ba4edf35d690c1efe361d1c6d710da10a6ef8984ec9ac9ac426dbeba11e510d610e88dde003d82ab322431c46576276e2f9e96533407be15359a59f35bea4663a39ac5f0659a93af033cae333d7a90f24109cb650a7ad3b400b5df6ae7ee1d47ff629f152ff65b8a9c634355951bbb5337e57d739832305469efc6d89a8cf815cd1b491471f85c4634b717e0e1e974d6824b4a59fc6c4857ceb16c6ee7b899172d0180aeb6ee82297555d66adc1f731aee48435559a7f30b1c2bfcd5c00b2f4d9e6bc943b55bac8a08a79dd476fc5c8e613b228a492b417c2a8442e8532d18b0f0127f9010c80d665bce90c60c6e627443f2c0e41911b226af61046efc8babf515ead92c10e9975e11e407adae51d354eca60135c8fb4fce6c6745de6a545d278368753d25449f40d8494ee211ccd6e2c5f69f0b00495951765ac6694eb8a139af0e5af03aa17595fa81b577fdb74432de471fbe23567b5f519bdc630d703766db703375a472b91e85ff4667d37e9a4b2fa077edec9df7bab658ead67f7c1ef802f2c13af123b02d371fd442ad4a5824086349e266226b52844ad77240a89e34dc122fc3988ed91fd41cd687b94d1bda5111cc3bc28e72d110135c120be0f82158e15a70c99c73f87ebf9b1a30a9b89529a56cb24ad5ac2c6df1140033bc615649c1678701a5a693ba6a9539f26689caeb7edaef916a746008459568f1ba8ff13a435891ba7c17c8b7c28054e99cf6a02af10328b7edb250ee28829edc2c47c7351c1b08c33bb12b05660234a98c6fe7c74fc6133ec14b993ad343e63f2adcf73c24b3f0d1e31186ca701abf840bb1cddda21100a5df2b7f589149770d245446ce678103f57a262f55556d9925d26203bf898ef61579ad155cc24e61b68d549c3a57aaa1d81b4f23e397fececa79fe8ed4209e38d8d26e744a321ad5b2b532717ec9c2fdf1d542bf2e04231561177d009083e6544c623fcb77af84e27b615c40a4355270ed295dce7e84821a072535ec957eb113f3db8e7351381a18f43cb5677e4cdb70c22ce6b0002768645651da2649f473f6d51540e19f71855b0bde2ac58604b40225413ffc276eb2275026b280a4e864152b59d315f7c24a6d9de8f3c6789903be17f3b8441e3ac187dbc99a385e2ca0692dd0ccd69e4f3df12136acf3ee57df5afca316059806d0f6d7d8c05a849d4ec0bdf5fddaafc2dc9b5ce2bbcacd62d319e6f976f424c295eb1b5238ef7761a1a9911813c41f410768a0c2cf5455c401c510d8f4e73e91b020201c048735a6189c20ca95cce922c53368d77f750539ee667ec95e35d814996fe4adc03cd8c3e1492bc6b0928c7755957564b07da9bed52ba7a2a94dc77566b8906847b295327923639bdcb22e9e73c3c1922b89b227817fe9f5941f8cb39957df27df2c668e78576b111091ab8bb5ed0822bb0ad506634bb92aad1fdeda88e0160e2c66cb4223832084e2658cb4f747b829275ceaefda2975e255b4eabb44d5d313368a29f5ac8aaf158af3620fa760a05a73c5eddc88b5b7749c33c5fd0f906511c43e3d8b59111bf69443319380d7a591bb7615ef84d230cc6ecd62f6644ed7d264f58b33ea2c4c2e5b9f0680ce7a517a51d881a980b4a909c5968877829d9ae40f5833ec393f658b0b6c9ee0b0f5d08d2505bd7ca2af5d90f738c059bc4ae97ae9b6c1485ba5b7a37219df19a7ab7323a116b206684a664d9872941c9012936d6985165e42f8132ab3d2f01706d99b12be4b5705845d7b2a1c0f4ff5387c4bb2d2f61f99b21d71d1ca5fb55117bed382bb2ec9c81acdab7108e1cd1339b2e6adebe321e02f6cf17f569102bca60ce6c81eae545ce5de1919c5ad0586ef906581ee434a413611dab75b59a78e841411859648c5154b49e4b67452062f77466041729ea4e76f423dde2c14ff61fd79396688d18f91c835564f0d28d6ff3a5fec022b252a1836c65a2d8d093b624d4c5f9621faf7d716c1f87197f0a441c69ad3638571e69c6c19d7c606967dd3eb437516bf1c7116d4ed651bb5f60984a702cb0a436b7bb366afa46e88f32503f98f9bcfafd8dadacb02dc735ddddecb3a02b7c099c2e96bf7a9fed31c6831dd7b3a6e5eb3fbcb54ee6a1da21eaaf50f1543eae442edb2f3d41ff5b593603093be54b497e3462e41d809f8b33c41010ec5d1c917b44e7a733dd089840d085745a2ee094fde1241ccd081879f8e45807b865880e57fd7fb80e57e293587534b03f4157298096e029c77d529bd0db727bed398be57b755f8294e37fb2632d852c2e314a3204458692c9f761b6939638f48815bfbff6ac4bd581e5580554e360691c8e7b0dcaadffd7ead2b866140f6d8897974d1313c2a90d58bbb7dfc28d422f2f31aa2c8ade70da51a3633c3a272ac14a054914c74af40ebc13d5a9414e47641869a6d3cc08506c57425391044d655b3524bc521233796b19c8190a18d13aca64274eefaff446d6c1e008e3f2c07bcdb61fb38329b01a559ea31b59782d0f81c1c2c65e8ab94679341c51950b458ca0adde1b44825fde912fb0c3e1d3001f1e5cef243a59a1afaa753e0a4bb144ffc04718a08e5f76d100141a11fd1adfeda7e9359e4f457c31e7d09cf2dfaf0e2cd8e1cc0e4d42c9fb5bf361f5887801d4e547e08f2a715caa07f42b66335ffb6b8252eb03b92754cb15178ed1bb6be8f1087be5a81a61c4c67005db610fdff10a4229accf57495fcf6aa0c20ee0b6a041df9a925e4a1cd7a47dccc938e6b96c5e796b64c507aaf20873f09f940cffcf4c5cc927cfe9b9b3b4d76123dc390f0c29ae99ca9e79f45268c9207c125c687fe1650f0cc301d4ebe0decaa4da6a8d5bf53566e28e733c125a5c5392ebe5d23191dd105e257fdbfe5a5e55a4375d8a64ce1a447aa6cb614085335c9354011cf0a97cbfab1e5b340e6f0e6c7c236523f5061fcd3bd722efd6d08ad23810bd7163aef8f224d042a60562a577d7dc0670877941a23f98fd37eaf3631bd990962b1b4dd9b789b0ba327526aaec144581e6cb700b64b751b2e6babaee50d0335cb962342aa65dbc74d97d3c18694154bb88f01273fc9953a816c17bcae946dd904243594238c98f17a9c805c85bc59a4de77942ce4895c845a23896a1975cc97436b93b067f0ef37d1c9d54b401fbb831db6459e86561b060855812034f08fe37e9e4e93ec23d8afa40909d2043b429952d97df28e746df6c1e7fa4aeec771439435a67782c4d9b1f0da0f2ccbbbf3bd565672ab9fd687943228897e9f2eb590f732fb25c3df2dafce7cab1c6a98ed311f8998dbb884f0e635f602b265ca7fbc3bc3acb5c2d00aaca61116886cc0e6a6216150db507a4f4baba75f0f4c7cfd0f355e5692ff15c793d5cffffb8efcd95e8d4a05c5222076292d0a3bd13023ae0737785ff8f590acad2ac5c8156188d85c717e421703bfa22a128290c4b68d997f9c919a5cc4aa0a6fc077da58c12f8c5a09a258c82d9696da204be5b1eb8f16c73146059a7165c94d6b101a4f60c0de4e926c4c9df071e0cb956d27d0138a060b19d8c1ab4408001b1d8292faf828f4c4c10f43c332e78ac96d86941b9abdc70d299f1bcfccda7575e2658861af1ba964d30a57bbae8c3a286908de8a2a6f7bf34ac8833a7d84c60f64d201d3b0e30de68c5d70a4db557165b1cbbf890552a09e1d00888f6b0ed7a8f202cbe2cd9a1418509a5c04a35b69bf46c62fc96f175b51c73cafa8b0669f10bcd54e64624c69e9397ac1e49dbf298add37dea9faf4ec072464c9ec4ca3b6d654be4f2946090cba282957e28619df607dbad1df760d1d4f7fd8fcbfc6e202c4e0b62de4420d70703a668b9bfdf0b979271d02a1eee5790fbf433f6d1a949173f119fefd8d652d42d6920026d4c5458121c52b2f8310f2a542aa784c23e4cada6ae0729468f9ab9c6680b24462ef38f4eb4ff5bf185fc130f1ef5709332f6ef85928d87dd945a98395e93d1af5839ab4d434f7cb0688ec597c638e58111d8e7f14575f85d9788eb759c141ed7adcb468f51a620aa1cee139fb6d8024ab008412dada86e48885e9ca6e608b2e2c53a8bee0dec8babdf7c782d118ec2827868b6a11a5f7d4c7e6591b71257dda022f59eea79fbf8a94404b59bb7375fddcdad726578df98db2aef6ffbdf5061b21f51ea503229a4409eba47b76f7ce72aa1f5d2de583737e0b594377823fde1dce36274ac675411ae5c488398a56210e886ce7b6d7183778db70e5400d0bcd5a6217ea38bfa820075b5d3fc9930010941e01a795a4bf2967897a63ffaaa064dcc9db7aa140f3af0ceef53b5bac53304a3f0b4757bf89d8d0c4911632a2244e888c566ddf2ca20cf1461da96a0b4c0ea75b9029985778b55a3b420fca7e699ff25c896d0e3a0fba3e35bf65da3289c8058326c8ecb2920d5f4fa810a8dd4c38134fe1657075568ab887221658d1414d72e27d78741cc3c8380c3ad00d2f15d7abbc81605784d82cdf266885cad6a3f2e40d251aa2d0345bdf0ca2efb02ebb5fe0713ae7127fdbd3ee9bb447c1803bd375cf11651698fb6547804235acf71f257e45b23ab429918445e024fbc3e92e23c4df6a0a18a246146c014f65462fe120191bc287d82d6bcc20ea94eff5b8b4fe1184ec55309047922afe57605aefbb5db09d69136ca6c9e909d6bcfb42d2fe8ec4682b1e1c1455bf223ce989677c21ab89d15e7afbbe2643fe981db4b6fad9b190610ee6092ced2dce43821afa2fe53ed29b57f322e08b3a395414cc86e226ca88ce5a5a459fab8c67a06dc2b5e3d208af873d99d247044881b3a16549a2bf18c6367a0d9ac1993628cbbd5eb5f8700f67581df89dd5d5aa1423c8dc44fcad2203ef9139364f2b22efb86078fdded73ea2908f676ac3366d821f7eb60b523481f45635bb875637d6cb4fa5b2489c17f905283cb765c1d05eb51122a14b98d01310103a758f6849c862e7b67038261078b50cf2852360e83151c022e5d669b8458e0f81bae1fd214df5cf840a51f6052cd45ba2856d3e3a36c5832feb96202c460fab556c1bfcd356fcb015ebcbac4b08bc159febec6c119e9ea03bbf3bb06a12cc95414e636feea3831448df52078c5c5d8ad88bfbe47f6f94679e71dcc2c29ad89e8940abe0ddd6fbea3820308be343836a2b18d2ac0333c36a333a9139b180fcad0657cbba74e5f504fd64ce0f31c6d81e7ff6981015d1705127ef154067c9bd5b234e9d06828588a618d352441443994c74d2e323a01ad4f2d318c3c769c05157c60d2edef2d921317459e5e753aab96bc0e903288964268038df8f16c5564cce587cef42c3c1511dc7928c759c45e216da5d6516af0fad36df165fb7f6b15e0e69c6515644b4577dd7548964611fe532d32bc56b11c6c8a7bb51d56f3fa190bb1f5bb3413c146225263e3b0541704f536c7a29cd625b33c8c2385439e8aa40df65e5782033333d2fa673a34748abe162640b696276336b0a158610c22b8bc8eb7a3a57549dba12bade1a9acd9ff5b4c7889f16a586a3be695939a3260b2b2974b242799df5e803c20a509014f973aad944f470ecfd216f2ed6cd6ecb0130f9e3dc9acd989e778c6b7cfa049928f0e7d19d2b71a99aeebfa702cbcb68e897c0c0e7a1ddc57a44dd7f3ed18a6b7bfb7c48b244bb440c537807699e5c475ea853e218d4274881e79101a5ed93c3dbc9876df5c41e64d1891990279cd7e8a68e02dd5c338d90ec1fdce2b9d213c65cffbeccf57527c3965ad1c900650b751323f831fdf073a9c5a7ca5273babacca2c698a7e40794e5ebce601f12cb40cc4ecaf8173ceb9753ee566ad46eb40415f3c40b90f5c174d1b5076164b810a204ca3444d6ef155a797f9e3acd6dbbb772cdd3935e9dbe25c0ff6956115cadadfd8efadfbd21fb8ef824f07bd71f9f3200f8226f591463300dc7fc9e8cf8500852978aa6df2dccf19af9a8c77267ab36369057d70d5ec1ceefcf338ffa6cea8efd9fe06bbd209f52e6bb6a759018c7bf9a391ca5f48abc86c31247b5d5cf7d36c7ae8c7b3e225df18cca4cf3f0e8ddbd49b28fc4077b7ce4333d10af628eff9ef500526bee2b92d8a25db5e46b642fd29730f3171abe23d70a7661861c87576190f7134820aa785d70a467bae3c71ece768e4cffb6e88bf9fb9b57da9dcfc7453aa9e2fdf23e29239def6fffca8c835f5d8eb913f14e5748db766ac467280c922331c49c34dc8a236c69c0d9fce3230e0578fac65bdf0707bc2872b9924962aa565df1286638464706f87816b5d7eba344a1912ea6181261ee2773e306fba3fcc94e90cbd1c5c23f8b4db1137af861c7514ffcd3835eab2a2e126ff0d13cb4eef1a63599e96b4a1e122b8286904a3d3e995953bb5cb1e9f4b4d2cb6322ed5194c5359082293353a57e8694aadf669975f97ffaf631c8787417724a30808ca3414"
}

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

    let prompt = decrypt(systemPrompt, process.env.PROMPT_SECRET!).trim()

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