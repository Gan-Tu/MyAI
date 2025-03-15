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
    "iv": "6bda3382c14799c63d8133d5e7082fdc",
    "content": "8b49cb693672c0f1efd8dd238d17849f2351fbfd821e9489ec86c8b707cfd0e57f482aa7fcd2c4f25d1a3359f1d17824e9542610597414517e1382b9d2f17ffab75369b2120cb68f4d4f4f077ff2d44ee71acff587460b1e0bbb4ec73dd98f64548fa3173708b454f7d38e1819c33bb948ee9ea1b7fe4106905ac548fbd7273e390c51e05c14fa3f1bd7447e104e14ec69e9f31400464a69d097653462d2ff3797e73e3dfbd3ce8b9c442029bb191764bf818e6c7a9d109956f9cdd9057664da9ce46c6aa30f3d4fbaf64b4ee0227f53530fe6e6d8df281bd345e2bc139bcf1053ec4dbb917435925803f677d95f2e46e949a55a1aed84d5aec7d03d342e4e2b65ce5d281c50576d115a626cbf1c70e93197fe7405e601aa74857c39ecaf8f519cd4923d2354f0c018a9777080af800491646d95aa22fc5bd1d7e73da8d45742e650807b734bd31256746ecfa6a4d94494cfabfb6d027ee0d3aaf443dfe2c803a78639f4ef5d4e8e359b1d873095a944b25cf4cb6b67aed47b9fb29e8c652e93f8a08a5bc892153fd4e9139925b9c8a96948808a6dc590ad32f86ed287568bef675cf78358bc73003c2f3913a008fc4e111bfcca7139b588bd138df8c5ff12cfd31d96bcc301a61f4f37c4d2ef39dcf9502af4f0992aee872a09bfbf5ed0993ce561e47eab67e3280c88113d3eaf6f07666e601eaa0848afb42f2603a401d168a9c99880b36987dc6d11f5f592560088fd4dc1c12a6b67c1fea9c509d925cd9d9faca2af3558cd61e75147291c05a0ba926677ad09936af50f0ba4a30de479cc8e968568bdd8e52c7a90b3642dabbff1838a0ceccc238df6a7312bcd3c6fabbde32d30a1c7054505b98b3e25ba1311133fbabeea147063dcfb4b98125a9fe07c35e47afe249f07a82fe9d8e26682f36d70881951a8daec83e1accc61301232e264ba27286a9a9ecd9f6d6ffd4b8140b5a5abacb190ea266708dc168fcdcdeae7abee4a8dbc1b3a87313742a0793ad8f65189591419995b8e4bec9706842a477816e4ebdd0da074e205861a1736b02ecda694e175212c7573e5c4cfe0d532065914d550471d3d093ad39b6c45b6e14f33270efc4884505a4866eb023da7449b44671631f878e0ca0e94b41ab01bab1665e89d52d6f1a89d1bea8e7b7dd49f649542f8e0f9064667b0e075bfcfb72fac689e5df33eb6118ed7b226416555dc4e184f959ef6490328f50607dccf31e5f130cca3ed7d0cd37dac9ddae46b5049dbee057e2740c7f293a589ec616fb90d1fd3bdb0e97c912e0879c020db6ccbc44884b4fe4b9bdea18e4d5aabf067751ba0a7d5d45cfeb52f24b1e5f39cab569ddd160c54a00b5cbb63af243161543e7446a11f60d80f6db332d804d3fd3b9ed96313d937c4c28eecf89ba4266af7beec6d6da3036b1ff3b9721913540398eda32d9937f1d7f8ce434741f109c3c2fa8a0b44a0192fff4db70d97d99150df95acc6d8cc88daf5617552d85b739700bea27c6821a54c684ea376079c723ead003c9fcf18c1deb26c741e9e44cbe6a6f5bc6ccd5da38680485cf6b4d7a29f454cb2b19d378b40dfca463426f9fef613a5b8dcc695d165a4b6047721299a12f7e868ffc33277693d567635e669bd06470712e7d5d2511e76e9990b4e4b4bf222a0ff18c6031ce0331848b75b018068c6bbbaca2d85e1876fbe6bc3f5ffe2e1b52f86b88aaaaafee756a56794ccfa5c4594f660bd2caf47a7b2d5bfd0285b86efdf51f79b78c1849e527f46e9b05a2f83bc480ab912f7a4d66e4d5a4bc023b4ef860810aae228888e35deb4aa20cacefa7a77fe57886970bb47071ce7a723e19c4bc6e62b8f2494f8cb2f7d6a7647c416393e41bd830ed561034a5cc1fad2b19abf72d036cb9d9b79a35b0d4cea758e3cf244dd743be0de44d2a01cfe685180c9def1495819bea8d630082caaba6d1883ffd29f2af3e3f82b0de97e98cf3681fb9ce72e3dd133388ca4c23b98ef289a75add9665c9bd3053d54aeb43057f978dbbf5a1f93239e0753ef6dcf0228e8a72ad42908ff914e522802a10cf8ad0eee6384cb158cbae3a65a9374e300f69d6e03d45268fc4d4c466e19a6026aacc37baf5a8edae339631f8db2c7748d52bc675bb37f81baa8701b983757dd36e0596c1f2bde8bd75818d908653a8a438132778a7e54358001292cc3fcc7a03062b70b2a149ce7d4cb1a7c469428ead713993140b4b511624ed993bacc443f3276c8fa7c611b3e1c08e43b00cdae25c5a8e9501a6207037fea9fe5c7fcd8d1c4c76f8a5ed90b57175422de5f747eb6c1cf27d107539b57261f3c74cae3cf103523370bb7722aa012cb5b2913167e2c5e727eb76e4281f4beb47419d36d1696dd722213ea3c77f20485968b7e9c19ce6a6eadbca1de26ba17d0bcc69597fca1d3ccb655fa2dbe5238ebfca701de02c5377446ceb3a686d3cd9c711625b3cb3186bea345a0c2260c48bd2c0bd2b4cd28edff486bd37e3bd5ae8c5ebc4286f3c0e1a21eb185460b8cfca088e97471274d3bbad5195b78ee4b3569d13ecce9b0d269cf217dbfd9ce7c6a4e5a689e69fa275cd195ee26c922bb240c35c08ba11949579a55621c8ff507506f13fa5414e1f68a1cf769233f618f24785bfad31faa38c6f6ac30a166fb1bb475650e120ded67ff01161651060d89a687688a7a28aec1a45e631478268e7753db580826e7553a4947b864b51ea4eac058f6ef41170e37849532a91afa9ca7c1422fd611126453471aedf7c38efdd32d7cf95f092a6562e215a0fd7981af2f878b21e57152a3bd8f64ab9468880df6738db4f146fe5685af88b6c89a64b649256f1776920a0a89c862f91fbc3bf1fa28ac77f2a7cc88bbb2410aa13aa458b94bacb24dc1c0b81dbfa223998c80628ace16192fbdcb9d81965d3577a6f35695e9df0fbfe5ce3dcb9c93e27a8d87e368779d8a26dfd2810cfc6b7f4caa3108511d46c546c00c8b9401b96ff949f72035c92777ca3b67a60b31e343971ce2c15aef971d0a5b0a672e2b77470d093c52c0f83f37bae05242618b59375b973cc40f20882f7a1bb7f09b6d5d9e6391d3827b903c2d640716a0581fb5127639229d19b62253d3f8278c892f7f5469ef8b6030a1cee513cdf9dcbdf1553c6e3df3ef3d0edbd42a16e5f73df67c3c104a53aae3ac1ae9b9d371016b2a48f87939ef898e0fe6696007c456f939512d65ce7ef328f9ca45f191be2fd1cf46ea2ff542ffaab0361a2422e8ced7ff3635a067338eda4e4b8c6d40b62862ffc8bf5d57cc79ad08bc9a59f0eb75748827795c589c5134d6c188f0724d85c1b288b07b0c2eac90cf274e992c8fa48ac320628b975833959eb03910465330ed3e88c1b634ce68cd2b1e1feb07ed7b0b8c151804060c523e412c4625e704ee60569d1c5f30089e168ea8abe25105ba7850c07be378fc742eac2195f79ecc8af20f31624fe5fd8eb29fdd0eea9a70f2d47e5dbb42d88c891200a09bd7951b9024ce6b34085c7a7cf539a2554449d71de0a01d958cb2b11a2cc493076b71f3edc5704ed356d919c2aaebda5fb5bc27ac739babe685359977ab14929a49c5048eb1611e8c15adc94a916dac94ce2594fadb59602105df80b9043f87ff799be32ba42fae9a7594a6c9214059eb118aaa918d677a312b1f156c2533ce5c39d6c62b163855f242101f21ff813138bcf7689a81ebcb3fc6e312cb223db766d85baa0cab3e546581b13de074e3b55a31c8921f44cfc85e053ae0793e9f423f02f40f6ab38ec7d624c6f6d62bc4eb611dd37cc8397d341e0799c7b5c230e70ef8e0a61d3e07c158373194cdb69886e4d23be85414e6a2a25efbbfde04a1dce4ed7eafe531c6e02545f2298b94463de3aaa7cfec42d9f5b5c25d40c6db8f2daba8eb9a8c1652eafee733a7d294f6572618843c40cbb4d1b5917a4e093334ed4490c43daf4adbef3521a019da81e12d6837c5c6a1fe054636b853c6c47573e644b284e76dbc3836eadf1a89b6187ec107db5fec3d4a147e9f4937051a7490300a2b6936ac3aaf1d676e3e850416e6ae3f3491b5cc6b69cce1d1e431d67e14d786684345c23004bacb3d357c8994e277e821b0834fc9f90e5c2b1f68f1d33a74420f0139e2cce703b0f1d82222634fa3cfcfe21d8bdf19ad563c7078866e71242c6182236f0631c25f7ce02daea85b609020e8fe881978baa52a80f93ec8369947e66606361f3440dc6c2f6e7875f56020be167ac7f2fb79f8827a9fb82fe1719be2871210a28ccb216bb07548b60ce7b939070f0fe7c4db5493df9929f98295b0b664e46da1e497e54f9d8890e95af985cc899cc2d7c7c1ad1475e9039dd38b37abe5c6492d7da517f97b06c56de78b3b94dcb9071a58a75f55d5ab2e1fe494ad30ac04d37dc0c99d4ff920caf7d608de3969a400681604cd392ad6e5d3715f05290c966a41dc7ddb1bbc7371978b4aa8217e1b8ad575aef494bdf7404b53a4b4c4fc14f37da3fed134dff75e510d116ffa9ed4565f22e17495e9a2ceceaa7fe076f354c56615ce60e083dc67c70cc69aada1c55431101d34ab1168f8d74bfa4d1b548a4564f76c75fc4c2a75fba575d4197cdd7d488284e77e68d4a9e310f3ac67879572aab4a7dd7ae9024419dc216a6da3326c185dd2bd3598bde937c4ef311ad6fb75d50ae52a1b03ee2958eebb76685a284c794814092d6be6944902bcccd0bb65235c29e07d303aeb74c081350ac5f01b983653d8e2f7d1653b99674f0e319192c9649a3ce2cd811c2be4519d8fc8afa488c306eae0349925dbdabe50c5dbdf1a053e7a593feda3732c544c97981efc244f2aab35e2527ee6a1c9a0082ae71566b225c0f07cd6fa67dc4c4c3e70fe064fcd007744ca5c6e32ec2d7d8ca5e0f2993519d1411fa3c9df7b4b035fcde70cec6871a4f8f1c3bdd2531af08b952e5613f5240cefa49233a5ff0fc12676d38db79f1a4d5caf5f525cc50661e7a95fd4b0a007cabba240cf59c6dceb8d757a2b71ad98fa96c3e96a67b242d663f78ade1792e8cc15ff59a9c0a86efeb37185bbe08b42d05a0655d79c6e48f6f7bae0df75ddb08547514479b0dc38a02f0e65bf33705f7f1209ffc0b4e94ab510f691767ecf908ba7d02d10ae8bbe45a245836d5e88d36a2abdb038fc76a4a9c79ead3da21a3247723d5d4dd67943bc10f03dbe3d8a0376dfce9682b26c9f95bbaa7dcbb2a8a95600d834e154a2dc89c4ce3c11e85cee12ba282bb8dbc03f8eb264c72d2f3bc1cd09dc60377abcb367a64f183373da5d329d290492bdd3d0e9c482b93f786c99364596d7d26883f1f30e29c52cbe30ae46d231d54d0442fa8243058dfc919f200d742949343d86094577b2088e1d408769daa5c91292250e2950558ca303f2977ee9444b62b149493201f3e289ffce50e202f59bd17366a328cf794f250bdcd90db89ab285f9d96267074491b449c88111213342484216d86fafdf6f54d44a6b66a3f90d6e317e23f75d6459b4d0b0aff792cd67a7836d3db78ae9c60d87cddf0e0fbe4f67e5f4550b2ab73694272765388042c39f775a40b1ed6e7e81006855c8cffe3a6aed4d70f453a67f09b5a7a61adffbe43453009480223a3e554f25c873053da2759c7c1894df9efd3af92d31e8abb8deb32485d13e63244a46a14e51c3b7923a1a0f26185a8bc0a1693178e3dccd45dbc9fd76e63bfc723b508ec652d9a5345b23b8bd92b54b013e66011575fc8ddd2702f20ac0b5ba3fb759abd1bb1ab42f110f85e707d5e6e5ddc2738d25d1669bdadfed7f0dfb73bfe2916a4d9eabe13b687653655b6458d3e9ea55a44c9a58410f713822a069f5b0f945a7712bf4fb8814d55a6070f49d6098946301b0a97e2d433278375158753a62fe0b00f9dd9708f2cf495c5c5dfaa7bce51e1515fe28a25c367e5c0167005db84fc352f7696e786d0db24503506b10c8885a04c94f1bb697a88f63315eca76015d537747a36ea4883c0c5889bf475d8fc2ce35ab0186d5685202c9c17e8d14091642dde56b90d5eae3690da9e49caceb54ec0384bb081173a75bd2af25b4f5e27d055829f966527a8dc0f1d31fec52f22af515a7abd2bf41ebcd81a36254e9561a32edca051b87e8d6837b02d5161046a0caffc639baa934834c9cc5bc3db006a4565fbc34e0df02836df63e5c694ff806a94762ef5f7f54ed42f5e0e4001a8b3ce229a3cea4905d4515a36f23270587a2f66361015fc76d2ec5ea7f449452515e5e70c0490451ffe091320357fb3ac2fe3570092220dc52ae3f597d59d0159bc806f277ddb7640bfcf230c460c1d8ff36842a25d8def7609633a50507ed61fe2d66b5c80c734b2345d5a1be73164be6287c08b63cf24b5a3adc15c25f71c2abf5ae760ca1ae398aeaed1e3d2dae82e5ed5167f4d0619cf3a89bbcf2ba13684d560177a76c8bb29ae3d429975ecc7935fb3329d666edbfc02c30f825d49de7a6eb31367280dc51398a359931fbabd4af016a36ccf92dd423103b7a49ac68e6beaa09e7ccd7720f66fdefacfbfb643964a0212bc4d31ff7f663b58d2dfd4ed162d87c0a7cdb34dcb2c527f79a483d636a5f26cf9744d2ab3c75da87b5ca9a1a5a40136a2fb5ad52f2b58fa4fddc971fd2de43085e8b4ecb2e6899f58d28cf5ac32eeba15361de1351a82006053da81139da628182057dcbef370337f284fb5a425f9765979139664c75a8b65a5eae55f3f6b3f7749d3edee63ef8e74f10a4c3d2242408656d0d07d5be6ecc9fbe52f0046afe9bf4347a061e5a7ea3a403753a1631147b69533da61a740077fca473b35486e334baac22722be1a78c504ccaa51ed5a432690f373a17d0b5a59e5752d286e52f897a3530558e14ba4d1cef94ced449f1fb6f86ba3c4c1f3f4b81babf6dcf73b10aed9187aaf04f5866d40f5826b8dd4105805db019ecf982d53c868cc706e5526d8b442da54f1c746270bdf82990776cdad3be7871a1e4c59b5cf31ce4ff462b7b02ad6d3a4e411f5fc6588a522b8f05f28190fa92dd9994225cf065e24e09df7d338d3407545c8e9e68c13f35738673e48509e804c1fe6069077ebb876b859c7c48ae3eff4979c1e057070448b66dead6afab39ef14db2abcb3888b200e66413e65114159c1ce1007c816c685ca90cb3bf87efba460b212e7091b524be954788bad937f70f10d3c8eebd16d29c79ab185bb02f6770645ea67170d26d594a8a8d1952e868f3caa5e0e76cb5800500a7a717b41e7bc61f937ba360ade0bb0cf05243a1c06686903b0e246487296893cab5dd666ab7aece758d33d7cc82dfc8f3a2e250758e8304ecd6a4d72f34591236342585c5da00f2b8f0320ed8fee2a2f1e0d379dba5e8fa74c69c0a347181d6e2aa86f81d1f9d3ce5b81ceefe8b680c9ee15d9eac2f9a5970c4c1bf93eaf8f2eae51ac21e602012031fd0a270914cd09866da49cd1da04333754e5c9ae6721764f77a1debbdbe011ec1f87f857795714b01896a113e11aedb7fd20df6737f6806b63445eb0ad11a3b5552067d0ca8f018773b272bb14688711daa7547de0d0ccd2c8e4f8c6618617ba431cb3ca0c65daa97003ae0638018d1231a0d400990d8771bff442d2efe30e045e2d09ed1c81b120d67531ce4eb18b6fce6201d39d38041374f53623963b1216b8648b46ea2c41a5a5b715b55681ac28c986fd0a7cfde9ee40c20535c518d28efdc54f391a4cdfcf3b484be1ef0a3b559cf457b93a37064b32311cf6e471dd7737f2aef84db50fa07a01c77aecab6ecb9f9d120ffd88717b11d867d2a918198c3e8cc88579c98db0891f4a2d99073c9ea8435bf73b35884dfe50d4f2581fb3c6a8ef4e54d2fc943304a38e37c050727f6dd6063baf16cf401e15671f9433e9d797a81d2bc1d5f508b96bd3470a487659cb1742c93489a890941117a79c71fe368c0d3192a68ad5f9d3cff8e36374f7847ed16d633bb49704657b3ecbe98d4c0dd8e90b4bbce33c5eb60b57ca3e7c390dabb9ed2315597182582b37cd7600a26f5bc3fca5f91d203f8084161ff81eb215fdfef2189614e652afc6a3c14c0f8a2cacc44add6c6587dc08011850ac22ec6e4231a48797c3bc9ea49f60c7c1d8b097285041be47a66f27bbe01e1636e9af71a9c0ad87309dbca96771660855e3f84eaf694cf81ef8c33558f3414016e74545e208082587fcfb3d340b741fbba32431a0371009ce7546ed0b9f8d2ef172619c1dc074b1d563174731e45cb034aef86e5750d39f34a6cf4f67a734b557fba017fa46b59eb4944dd492d3e13c6e484cc3b63b9b022b8feab7519e3830d8376b88923cfdc948353c0e765f0558503f9fe336467aca1af75f3dabdfa0decbae4576b5304196130feebefdea40b04a9e23d4d39c9a1177b54e87c1030724e83be3926a901b0e55641327c3588be0b0f2fa15fe7fb81ee1581707ef0170a24fa9b4fc6dffb746c91e560398bd2a4f14d5be85a8abab483805fd53fcb5dbd05795443ba35711d493587a569652186f862f73af2a054a33920d442e4c9da7a5ad62dabc635227becfbb8db0659d0c624ac0d11422417c3492f97a2e8ccad32e4c1cb034d66da67ed5154b9abe97410e0a5ac05da0f157b2bfbcc91dd0fcc9c23223c31d7a34e815c7a5676cb83672ecb597913e7e32fafdcf54601adb2ffbb94c1436364c5e0f2f95681d5f80bc173a6d369cd6704bb0e1527c8361e11171815b0a2e48b394c2bb090f9e9479b8fe01b3cec04edb7d7fa2452c1af970ac030415ce4cf4db29a5965005dfcb4bee3fb65c50638f5767c00350aed56cf3a9316aa8541ca01e831e6f44ef0350370ef6c4fe36b5557cd2d129d0247f426593671edefba1e01f5e943344d2e5c1dcbb720e313d91787589a63f58df56a938b78c0ac40e716e1cacef1582d96191e90340804ab6c283af27248aa287ff916ce46508a45c4c4429f5d10f1622cd62f90eec345fa7eda7e36057c2b8cd9535300998a4cb1c2587f1877d18b782fc646426ab1b99715883cef34a5030cc1238f219c777f154c48355b08b4bd5bc32dd8727d8d1907e26f3e2af5e3513bd97e85538f2fa44f9caff3398eafa7644761a80db8ef94d3cb65eccd44e7618384b20767e692ce778cf9ad1063b5b6c5401b8e196afdbebe2abb57675845b060c031923764a2f6ad2c32b762de8cbe09d7c0d344f4c2a22a088a11ac53a417223d60d91d98e508f6b9f4078f85519bc6cc71fde82a97d4db85a6b2569501f2442eb40455e9d4ef1de9adf201527a4baa2bc8bbb81a3c4cbecb35365808fe8daa3ffa4450523e8a390f4098e77e5b4e2c578b09e49f19afe18f65a279d171f262a3bdd29659604a9990efb0501be28414e428dd7c4f0d08eb64dd6e3ddd1b7612e2485d034bd2cc3518adb91f2e4fe9b1033e92483776e757c9c2441a6d93e17a1e201ba08623e54572dd33867d8d8636864c905b90cdeb687b62afe51260a477f3a7d711221d2824b466533e8c0ccb86f451c55aee51cc8bb0b1c4a386a3c1cf08008ab5f647b9efec5c320b159ac07a253ae51f9b98ebe197dacc5f2b1ec54fb6cbb376118b491710bfa09532151d4af73a5f75e124b4ff62a8ae26373bd9f1eb9282874330d01e65cb79784bcafe3639ac90fe0155b7553f70402dd66da44c35a27f0bd9c0f08808f60164ec1a35af1c44b34d50a313c61882d8b06980ccf720b4d887a3e657a97a7ee8b0e1d1ceddf7036ae0ced48d10a32c20a1e9835e05d29842024a8744b950caba39b50e3f64189642fb61c80ecd132e2aa23f44e17f4b615f615669878c55845a67505030a785f1ebdf69a5403ddfa4dc52c5101e0f739316a0af1a3338c7490669f575b29238e2100d57cd2bec7de2529a6c416ede00e17f80b5181ab64e5f497dfb24f8d456b1cf643e7aba6dada6de7df001a87b4c765406e56e37cf88ff26e692facdc5cfb2f25502af3a99b927245be107ad3de6e2d1abf59159dbbb4c1a620e46deb83ba3e4f2dd1ab1e34e332c185cbbb457554f7254778b4898ad17fbf321b3c474c3118feaf6f48c5da6bd26983cda31b9044bf10db90abc1dbf5811f1ba2ab2b236f6191ffc47d42780790046b730ddfb0badc8e8abfcac1386aafec1d9b3385fab2cf0da6404d4efd21fcf0c95664066344b838b3b133c8c893c5a76d748c37479613bbaeb59aa72acc60df8837f2dcb2931d39352fb8b945f1ef80707f1e326bd68d540d6268faf142998053b98e7f5af0a5f465b0ec4da5fe44ca3e0ae101cd3a1a88f8768be05884a7869f646a078f4edc04289dc786f204ac0137fac4676d8cb3ddfa4b1a44510ba19c5662e582214c70c5f61cf5cef832bc9446a3c32c2f238a7fbe314023088cfd58f510396a63459514ddcc31d9b5bcffd174144ea1c472195b0c18a15d9a92753f5e890ba6d5be4c53133b0536bb9f8e15336b264113f99192d5a4903212317751b494f064265f5cab9e43286d78f1af728b7e2aad707dd700660389487849dd648321109a1ab91467b97a79506b8b4aab02a6bdbc863863ea423440382afe19950b096660b018a07187ee18360815e675e606df62ae1632c7dc3d79283ea27f3bd236dee4a8bb912722de5fa876243029f7a8dae4a27b4b14e29f8084494234766bfae7dab14812a69e59834f5b9245d2b2e4b756b775aed0707fa3d95166b7d92891fb7642df525e4b288ec3368c4d390b15ad6dd49f18bb788e8e4b9bfd7197dbd50f2db9f4dee69568e14e4de97fba1342e862e2aed0bcc28670398103778e7d93ee6caf547e0ccd9193e2e4d049c85fc32aae5b842c7dee4ff1826ff5b9255f29724f38c3dec5685df79556fb7a6f53324fbd5edd0c08124686521079c65a86c9a3b41f8aa2f89272ec56381c2c0323507a9eac7ddd5b5950545ad0f9cc8c0f300a723563f35f76ba37e17826b84e7f21b421b19eaee15c995c9ab89f67a9487d8b1ec840b850a6c64e3450abb5bcca35959b7ddcf622b1ba6502a9941eba8e8b667bb0d6980828a7eb90d9095a2dab77da9c26499b4099543d1f3573d1ea50a562dfe2032884a0b167ec5a6a1eb6d32757b2eba40e88bcfc618107649965ffc593e97c14360f56dd3b8c67b9c1e0b0aa940d190761d2b059e3a070e5d61905b08c08d1e014c224dba65f5751c800e39bf3f82f6863e186f978967980817c70bd7e7725e7cc1ac00caefdf7ff339b5cc414507fe265c74293402740a13b682c4ae8111eecec698740eaf5e28b8112ef30cb30e3229671ba7f7b65e10987e179c5622e82a1e8e1a6b31569feeda3f14ccdaf47b7bf0254aa4e987786633e17adee76730e416f6339cfdb6e03e2a5814308e281a66634932cfedb425b5f77f29b44fc410429a4fee1eeae020f16de343d3a0293db2747936dec1efc1f4fc10a49b06ef37206c61113b177eb6e123c95efc81ee0f62e97f09a5a818a5670def207dbf8709d5ea9546536e114ee3ec940b889e198c13ff4b8b8a62c8a2eae3b4902453d7bff69aa2f89e3ac5cdd28e5730320f6eb1e42b0cfab3c23139d1451e9eb00f78457215cacd9a0b4f04596a9dae697c4f81f39f17078748504d0777533d75acb76c15fcef18fe00beca9736433b5e36ffdee9db4dec44217a6fa58f40ce19250602b31c4db09b496d679904f28d09a512e0b03466414a74934d3b79e0d6d82b35c0943428c0bba9c90f9064d21013c1d1960d3d99ad42732708bc8f18aa3cdba3632068b85a2792c245ac301b69ad4d15a9d6b243056a784bfd3d005e966e28d56aa416cd1e071eb8168d7931c152fb19b29bf512406b7e2fc110c16a0c2b081be4f2e18bded76f8f5b98b35c465551b568e408f7f8240890ccd832d18bbdf45d0ee9a9a314bda7fd4ad7c2afd09ae9fafb42cd90851442a312376207b11939fe924c5260e0ab4d0f6e1c57f1cf8a12f412301a867b7ecbe049b035f5d52e565dc73566fd5fb413e6d6d5531218ef5b447a62152f0249304d4a5567d1be0729eda26d9db1159c4259af685de5c24b0cbf832910e51b2fe5518722255bfe10145b548e049ac851cfae8bcb4d36c3d8d61c54b6a89f1974b1b0fd490b3da2b35cfda4d516ae2346f3e121160036631087f1a747faafe394bd037ba2dd1e3497c2e1b7be0e2fef2d1b2f98ba326e480521ce285d8ec422274c83b5a342e3300dbc79d52300a751f9315e18ce0bc41116e21847abcdba7a05986996f93fffddb5ed6d8700a542912795c0300f1badd777ecb292a8ae770be07d8dffec1d797942d5e44bfed48219388986ddd7cdf46957a13fa83d9894c2ad1da4ae7fba43452514923b4b2348ef69f2afe4481dcd61b62a97774f992fefe14c35de462b9b149e7922f03ee6b6272b9fadcefb858ed79aa0447b4586baded9f319a9ef533b3d705227fff47d5c4425cb16c9e065ca648ab32c65ab7d3738963ea825812028337fd86c2a0de255031adc136ae30f81f73af01358225bf02279f8a5d509d27c87d4423e9b83e1b5bfb6e56ad1de742f9ebca918c95dd6ca7c369facc9681439eff7fe336dc0241842d881d21ac9377a609d33c1abafa15d4f9cc27aa50a89a17e86a88000a32b6a96aeed134d2c0d47b4fb98a3c620c04a53e59a9b5108be7df04447e79526611444772d0ff7a79e68f6f161fea753b53ca9e1c3bd850090fef18bd61264d20378134128af152f089f07737e5c68dd6d43a6fa31e26166dc436f5a7125561fb58af59b00d5dd5c5f14d9c42fffb54a41e6ce9d767ec0e12fc29ea2260ab6b4e1430cbc6c47464551882827f43e1567dd6c410fa68cec0e37ea8734741e4e294b0c5fa837d3dfaec4dbfe64dcdbe8415b417bf068487424b951e850f7b1a80d9372fd5845aab88309f97fe2abaea47fd8be554ead33d73050a520873bc819aee76188c267a0381367d865d5c4bdf552b9ab5c7265401a92a5d943d66a00957a15f2b089b6e6473bbed8e64e3414240d9040a2a23fb9afe7726de7546955adc92f0a2a2cea82ed2e7fd5f3c5698928b3642645d948ed63f8c226351279ebf61f1440931d96e8e18099a8c88076a1ca71fbd64e39674565203cb18055999180100b1c279eea9ac87f36bd5eab67ade8c21723a5bc4d68a47b963fc4998c640b27aa659f93a635c6177b61e5cd5aa81e8696aa604d692026a0510b02a5ecfaf59aef568132c2ec7061206529c47928e5724b26ee5e2eebedcebeeb8c7653c18546f75b3be7c6a3076491f045097964fd48d286e72e7bf794d4acd3f2c72cbdbfecf51f388508600f10b8cba7753355463d468a244911851a91f10e53aa04dbe476279f5b5f702730135eef0a58a16aa2d4aa4677a400541f1f57e87d9a36c6821d9bbd264cae671dadab729746a980f4d6b8f4cc2e0c90265b85770837a629dec0fb6fbb04e36d4d285cac15425fbfb15bf610c5b141008a433ff50a133e85f584f4645f22e1bd8cd82cc5dfbd6512760611e875c9896322a23b39de81ddbced352d869fdf40553d599959bf9b44e07f7fe2d0e14b04de75515abc2c482d2e58a47f5f36dc15c14bfcb52265561f32a5a3b98d3547058a79d964381844864fb9e66387ed89da54262c29dc83404c1c1afaf9c7e404a70e16997885c81729d9d4969763e1604cda6d9916af06918bdb11bbbd77b53ffb938fc5050aab10da359023326352054f6d2c1c9b32a2f10b0d32bb389d8d196ac227472626d2e357e0179cf37976df8762e7d6844176c15b1dca0d106031037c25150b0bcab1872c32ad43e9559bf9751fa7f1c799dfa6ead549c132afc99689716dcb4580a42f3520f1b937fbb414fe60ba6b366411b7e961b8ed5ede215b93920b05b2f7c9a1006321df25117b53da9b03609652f7fe0ca881ae556851265fa04ba86dd4fd995c8c9692ec8b574c7cfbb8343587b9634bc1ad8c8910413d54354cd27f42cac7dcd673cf48061823cf9da97bae1831a5c4575abc53b3e8d5545bf1c95e76a2820fe1471244cc5136e8443d56465e3c3e491481f7c513c6a2aa38a70c2b7a6999774834c400f9c75dbcfe361c0bed5b4eeb8af8448cafb55bae79f1350006babf63732ab6225477805d44e64cecf47361a3c9d4b77de6b132e4b2b814a53a3f7c07e77202b080d8a06d6784226d89e92f49b82d85f65dcdcae19f5b913a1c9058e3a585d5e83a49afc48d65bb9aa077e7e050dd564375a61a4ec67cd8cf57e43e7ac3682cdc6978943b8fb141df2bf7af81d4d3ffe7b445ae63bcdc5f8a5b8d85b90d6d00d202553a9b64d93e24e81ef55e8edb6114e41d80566fbd49140e306b1613603f90d000730de348dce507f30320f446e04e45126e6f29aa2e45fafed21aaebac08b5e184def5d3759a695ac522da4d82ea9943869e43d45b73af6ae20f3e395e288de6ba2c7ad3d955220099fc6f964a3f67a40b91632e19df0520e60acd699963bb77cf977af5cec74cf11d24730224bdc8af0a493479126b677263cb20829b70292b311e23b6a393be1f55c07e0e82e4e06eda4e55ff47340343d30a4658394c0d63a674957faba915438b19fc548cbe7e55fab5c1d8a90759399d8fc2196eba96d0c0563cb573366a16b1d383e8b8f698269f0e5e7f20c1ff083bedbe4a86cf6796e16363e10baf93ee7e61645204a473930fb37b07b1b7a12bc5f4d852953a5fa4146bea97f8bb9e958b38302edc5baf50ce95ca25b1e70fdbb32750479e64ab614820f98d82566aeb5239fd21b4ff2d2428a20e213cb7d982484c108226010c8bc96efb00d1899d5886c5dd542e0318b2a44a578bac591bf899f0e1367a450b1c123b5044c6bc05234b9f683cd054c2a7f215a2ee9fd0ad05b2d602c36df006490fabf6bf85807a9612398d6c1ae9495a59c8df6a31a9f4259d013d564aa857172bdfd2be966874c225be56ec5ae36b54e505df01a986fc7ac207fd725d5ec0293e944df439d05a35c9636424c1ba9b6b8f323fe629ddd2483f0a00b0d809ebb73d4854e3de585dd28ee7e7c6d588529cea0dcf5fad8afd11057bea19f6aad4400a7a25279a5eb84d67906ee0bf558e1462aea87231ecc508b9f3775cc27953a42978e49088205350e072706394f03670a6ca96a0b12714fbb3a89afbb9fa29007f33ad97763a0abced34f40baf7b8a1efd3e54c4ae792c5d2a418de20e080580ed31afd1dcb4919d806b5ba7748b4cb94bc042484c8eddcdc47cbe8295f0ac7977b17b7da15c9358b591f8bbab599f1c111ff54e806bcf43132b54bce0a3d5b9b7b95bac492773db5c588f7ba3ad1ed20de56fb11b13b3e1160a72d1b6af8cef53c8ad026ca684e9040b6ebc8d5d729bc7ed640ff6e669071b134a0d56785bc799973e03fdc859de2301af58f6efd3dd2dd3afceffe8d2774a2d8fbf18411eb47afd51182f96cb04e34bb6c5fc7c62eb8b56c8723718dad0453d3235fe27a0dcda6195030954436c1aaa19b2a1c6f1688f80f1a719eb55fdfff506502a36c3c6dacde738a53593d7940ca0cab6cee11a01007afb0c5d62d534aae56e74240a05f7d1464be3a46dfb2b54ee703b0c7cba29afd93bb70bdf2f145bb04912a7e22b2d3dcd77ec8d70f6358f58d4395671d778ebea13637264448b920143de5960ff457bd5c0d4cb6fa1dd4bcadf9862a03f69b97acce98f39db4b442bc1676cb433668a1022faa093ff7d60bf135987175cd96c8b87ee5113c6cca569583597cd28d507eec0a2a32e7d92adc43d4281868d3d430bdefdb122e8e3e90d8b289880bcd0f48addb64e051e618f5fc501f9008951ae4f0e4de775c65921b14a95247bbd064c5fed8fcb7cca6c1bcda09e8a577e50faeab3d15f68bafaa5344dc18a8ec1d998cceb04bebaaa7eb4f3ab39ff08e93b1bb7049b1100f55e903c831f10d15bdd8c283c0d0a587525b0eca307d66159fb4cced7ef07d638bebe3b38479c81f5c2f3e558ce199d0d19d093ca134bea2d477f2cc86dffd68c5b70c249cf652c8aae11efef6c5a56e8b5a1a3c7e4cfd0d9d11421401115d4b6c475e1dc6210944e51d547531689ec45fc5edcc79d291e8e1d0181382172e9acc24878694517530945ed830cf259e9b3b08fbf25cc1a9da69339c1cc92c3ca27e9a3ae121e5328ed8cfcc67739aea2d83b1fdd1c14a48174f1426951e89ca257ece136606e2b160c4d0ecbe83096286a7e6ce4cc0f53b91fd1719d8a51697831adf1a9fea49f9192a200e7c064fcbccdeb45e1554e1ea6bb2782c05f338f61b1023421f66efc7633faad91f3340426a1c7e7a1f2912015ba6db4814e0b1ddcd09b1fc6eb008830fc8f8d430e16d0b6699ff42ac57a7e216e5f779759b03d86184455f7a54fe92be1cec1d9affc6d50341624490a8457ec4d83b9e17bcadb482b5c21badc2eadc4ecb09121d00b091c5a2a9c2d1342f378aa7ae2dd9a0a2cbee1421bcf78dac16fc7405cd7d81e797c857c8ca0a3eeafdc518a4837b5662d1710b6112ea05b8d73943e3c59a5743b87406ac177b14ecd94824673cd66d20d5e321b505a299bff3aaf3e50bb36bf68452f91c714a0f84702ecb52500d5eb27e4f7bbd2e8de3a357ca0d417d2f836c1df0d06cea7ea5e68b6402e3e11b65defd4407cea9051830a05f62f7010acbb614c8e787f5488e0139b83552ccdf4c1537d9968781b2b7d60bd445b052ecdee3057c08ed2da83f5dc5927d06724c55505c185c0998d65721a31092de83ce1dff4ba947e5b82ddd79b2437c2f6821b65654941e0f3998b206b9059239c77d6fa35999f6a4e4a5445a22a34cb71a29222beb0188844579990c67a96f44285b1283b655b69f62b22a9dbceb1b7072c26b1124b51af3878e07625dd1be028b6a20f894ec92df06797951502657b5c1ebc6811136baa800b6251eb12132c139a325f0f976e3d9445552dc4c32bfa25084841b7af29ea37c56e0b46cb62a693f631c586d86551a684036055a1cf6fe5ea50ba04aed58086e864d61a05b3aa70d31411ab0f05487ff1a41da23eb988a98417ecce28565a174c10c2863b25c6f9963b1e94ae5b87466c58846ea8f30d085a4adb353b9d1cef33a5b9121ad929f921f96cf141e39adcca32004d710a64ab6b0c953d3120963768a1644396797b68d23b548146d63f568b5374a99cfd4c70bbf8bfe542c8c7b051e326e06c44c7c4c40ed487d0018578783493d233ffbb2a0e6bcd78f64f22d67a4774f0e19ebc66ff9ec89158f2311fdbafc1542c07d5c8f293f908feeb3f06e543d9486a37a1a5999d65bb15c6933f28b530fe1ed4fee2530e1b490f255b9f39ab6e16543d980bac409efdcd430634529c795ae77760e3673b63d3f5dd0acc15bd340b2d9784ffe2be724b2db29283a497d78c80148d4ceddd657f6b2dba23637446196de32d9ee3cb82aba8e165c88110ca15413f8c5a48a3c3ddfc7bb7413dca23f3d551df7b98c83088e4310c2c59989dca731a864c9b11534160af5055b967868d4f911fdd4cf3e727de8459249a8871b1efd5660994ac31a11e90994990c19b947f80b8177750ab8ec0ba1f6dc4a619fed024e1a4f6f464d07a5ebc8ad6973fa402c54f1a14ea22b383453b15a9c9daa0f749d5e495b6c7322f2b91f6a4d8d28b138668da28de7c8bc9918a3613bd6bfad74e14b020ddeb3677822073679fbec333a570096af9242edabd3e522d1cb52d5578b521b3846e2e1203ef534e29d7a6485d0ac2c60eb231761c084176055192ce1d02a2d09d42f0d9dbc52ce2b05c64946c5d2437d729ea009167c1156d6928dcec397483e70a60f4826f06166db52181f28178684af90736a07610bde71c9a1acbba1b6e86c3de01c9591d3576d9995abd1a4a2061fe16e67876de4473fa159e2a05469cb359c1a4df1d859a9f40e15e8037b56f2aba32fb513264570a3032f9a0163f790dc1d87f62af78d0c050635020b324eb713200758e1d081d059cfb14537dcc5cfe38c45cb05fd57326d825c2e9d9912adf1c044d1c91d6495c30057cd1f0dd472d8e3c80d3f225ac0f6de634248fe8b4a7542ae60a6c7f4fe27d8181f12112296d80d5da5c5755c5ffcd8b282b6ebc2ca8416acda2cfc5e33eeced277370a6419472a6af9daf6930f83a4318c9cd39d8e7b091b39caf1d5be13d846225b2e4a50f68ce1aff471d31f436d0373e5d495e08c6764b01415cc8e2244fa8ac2194c77b7c99474d166b3213f662e35a2ae5f9682be5e13b4f8bad28abb311da070a3a53ed54bacfdd3003831010023506c9a1f133dc9b1dab2001f27b53cbc882a95d3cfb5e6a17caac4b0d625b8f26e6852d2935c14f6bf731d5812e2ced1a08c98b3ff1d349a6510ef04f4d896c412f41266e39f371374a4e9be60bbaf4e7541ca273d4c449dad245c209f61d9fef5bacdcd6806ecd9520a777897ec3e63d935e26d1a86591c59f62752a6d434c144289fce12b879c31327d2e9835cdf9a42e4ddc1fdc193b392446b96b93241c68d5feac6df41d586f1e0523280abc7208c4c14ca6bbea36a012903ec76c2ac2247dc73d54b05fc39deabd647200d6974e033456cd2fd38f01a207ca1e8ab125a8d1210f44dfd96a62e1404dd95b915b0f5a94feb19c3cd910ac1de781ae70b80f1734ce66557686e2005e7ac4170454d1ea488f5f546d3520265bdc2b4bf9e96c6b7212c8df55ff89ec2a0fc7e9c3f98d005cef34d5539e8cb609f5e1eee83cf2e30229eb498455475d57376472632524eaea81455d4db7894e40d86f88f334d4acc6ccfb31139c6fb9155f121a85fd72f331d958c9dda956cef72049f002ec034156acd022c0b9eeac63bed32e424204da670a705bf69b686cb52442746fd5fa81de72a58f5135c7055c4834e215875175016a2393d2b668fac2f293aa38a953d60cb16947a4efe8b9eaf505c0c57c86c38f871103f60eb3bbda069e87f7317419a81c4c2a1a7f310276af94a22e548aaa0c0816a14c4908f6d2f7ffaee9085632cbe3f65775b93b23643f67e6e1392de223edc8a03e39ada530434528c266267d68b628474d92ef1b9bbcf39eca8eaa379119799ba6f1f1241a17140b88c1a8c97db98f7ee0cad41c616f899dbe2af130585c9c9fd9ffeb86e36994edb105b28a9c9ad044e3af4b9ab20a1e44d86bbebb2a420e144cf5b869f42ed0e603a5d95e196061d578f476f3eea019a360b69b6da5fe9a728035ab4c0bd29ccf667e1ee183f7949935e5c09f325f1bab7944074796e44a364deb5858853fd4979d7046c2ae06b2dce57a819a72dc552f6277dbe1023d4e3f5b343c85410bae9fa349a61ccdea5020d1d8874abbf5328ee8435af19bbef228cc471d7899b0ebe62d91fb3e49cadf1dd47e2d1d8e3099f1c67f4d329063e8d39cce0821d5fe6e3ee1256bf116b60d637e981dbf64bc82885be756353a29df2cae7c443b75928143b7f76fa64063152955dc3ddf4e4026c466a722e13847a3d56a3813e5ea905d5e9c6892f9f02d91e57b8c476ef1a5e50f1fd813f1edcc554f0cd9f6881e7c8809253277cddbdf6d9acefb6df5e249a60c7c184a61802fb789cdebcf2dbc87e335e18f3e7e30fa9d1f820fede485511901ae8f3be81ce40127223f88e5646109d1df1e4c75494e018f402aa47062852a29bb0e84a055c56032fec52eb28f1b8ec9b09c93c5502ec532fb071617e045d17c2087658dacb7bfa8e28b235dece37c0381d3166286f2920bbb5c2195878026f85e66a2f18b390e4f21e2eb45107ec19a63e01bb00fc27ce1774cd5802aece8ccbbe39ea17510204777810f1ac5dee4b33278ff2039750d5a4b044e575f58df50bf6cb1d7a85d67c9f27515d63ac13a32b7a382d139b812aae7e3242b378d73fc9dabcc725ad2e72c99f5bc8eca83c1deb3ea9c749e3e8456e52f103e0417782fa4518fc25f988eb6e362d09622a088e43da96324ca23d56d843273825a910a5e15791c554f80350ac8610194f629e289c8858f9bca3f3256f5dcfff73b1c0e6357a78280f86aabf520966e9353387ac78cfdc463e00d5bfe3c1415366b2a52a03c922eba2adb86c6fed67694085e88dc3170581dd5bd5bd075395a140d828a562920077f730b6c0d3fd3fc7746ad7a1a00df099f5fb4026508253de41c93de612a9f0c3abc86ef0a7aa5b23d044b6013b2c060ea3777d1ae8416b220e2ffb6cd0928e2f105cb693bfeee28408e357a70828f1abd4668fe022136ffeda41200b0e8cc9d0e9fb9a29abb886c9d388b56a3458f2b0d4c6ed39f9622d39bb0f33c60b72c12b5c218f18bc1562dbca64625c75ef554e739e978c79980a257eabb47bc39e314fa49de904bbc9aa0290a3a2b6240face474fec13817e7d1406269fb79497824c216e90a473497f8b04afdf51b11889750a8278f5d5d7a9f5b89d606aa2bc6219f2bbaa73a63162814e4a3919ae29dfe0e43eb34a5e36cc097ac252077de47e56b596ff11ba80fb2c14dbd6639701aa6cfb7ce5a18407a7752f5fbd3b9721c155ab8c44c302276f821bc3c6439efe5c76392b4a35de9f980c395f33e2508c8caef526bda0f27e017c5c8d7b58b3232fc9573a6a593880607e43079271f73e103561048e734075926bba930dc892b4e38367e8a33ca3696045ab6dd6d263bc676bca1263891ea60ff03704a1ecc67eec5fcb9412eaa9c65255513422545c6e0c32b68213ff03cb10358f17aaae19d6349d7e6b628cb0c8d75f9c8604db53c75442afb4dd8b6c8bf13614089c3b5be5d016f4a3dcdf742d9618ec40ca072809311c72bf6568ffd3378ec87a6d0b862d9470e667489e2e486b6138fa2d776f490ff8af3cd1ff4c41b55fbf71afcd93187439db445ad10d5f372f2e985498f6463a722f39c8e384fd09b0ddae489033b60c607615"
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