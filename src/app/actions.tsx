"use server";

import { Index } from "@upstash/vector";

export async function runScript() {
  const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!
  });

  const biography =
    "Software developer, travel enthusiasts and professional dreamer. I’m Gan, a software developer, graphic designer and entrepreneur based in Los Angeles and New York City. I enjoy developing aesthetic and useful technologies for fun and geeky endeavors. I am currently focused in the space of AI and AR. It's also a life goal of mine to help bring to life and witness the birth of General Artificial Intelligence in my lifetime. I love traveling internationally. It's a magical feeling to be on the road, hopping between tourist attractions and destinations, touring new cities and places, people-watching while sitting in front of a coffee shop window near a busy street. It creates wonderful memories, giving each year something to look back on and remember. It also brings something exciting to look forward to each year. Even the process of making travel plans is exciting, despite the headache it takes to prep for visas and itineraries. I put a pin on the map for each place I have visited, and I print all my travel photos out in a photo album. It's a rewarding experience to see maps getting fuller and fuller with little travel pins, and the photo albums getting filled up. It's my life's journeys and experiences recorded in snapshots. So far, I have been to all seven continents and both polar regions, where I found my passion for wildlife photography as well. I also enjoy learning new things and skills. It keeps me intellectually stimulated and engaged. The feeling of mastering and learning something new is gratifying, and it helps grow my passion and diversify my hobbies. I like adventures as well. I am an Advanced PADI-certified scuba diver, and I am working towards becoming a Scuba Master. It gives me the opportunity to explore amazingly unique places under the water. I am also studying to become a recreational pilot, as well as getting licensed for skydiving. This gives me the freedom to explore the sky, with the ability to experience extreme thrills and fun. I used to ski, but now I have started learning snowboarding. I still fall a lot, but with more lessons and practice, I look forward to the days where I can comfortably enjoy and traverse the beautiful snowy mountains. I am Gan Tu and this is a short biography of my story so far Some people know me as a technical geek, while others know me as a passionate graphic designer. In my view, a beautiful design not only makes your products shine and appear ultra-high quality but also makes it incredibly satisfying to use. Thus, I consider my artistic talents really make me stand out from the classic Silicon Valley techie stereotypes. When I was small, I didn't know what I wanted to do, like many other kids. In my junior year when I applied for college, I applied to many architecture programs under the career influence of my dad. In fact, 18 out of 20 degrees were in architecture. However, once I got into some prestigious programs with scholarships and even put down a student enrollment deposit, I decided to drop architecture and switch to business and finance because architecture is not really a fitting career for staying and working in the USA. At the time, I switched to a business and finance degree, thinking I was going to become either a consultant or an investment banker. I would participate in consulting and investment banking competitions. Nevertheless, I am not a person who likes to wait when I have intellectual cravings for learning. I began taking online business specialization programs from schools like Wharton and Harvard Business School. By the time I was a sophomore, I had taken an astonishing 1000+ hours of online courses in various subjects and obtained 13+ specializations. That made the undergraduate business degree boring and redundant for me, so I switched once again to a computer science major. This time, I fell in love. Different from my childhood experience learning competition-oriented programming classes in China, the schools actually made computer science fun and really enjoyable. Coupled with amazing professors from Stanford and Berkeley, I focused on CS full time and even finished all the graduate classes I wanted to take. What's really cool is I am really good. Yes, I have no shame but am proud in stating that I am really good at programming. In school, I also met some amazingly talented classmates in AI and ML as a part of the leadership team for Machine Learning at Berkeley, and that's where and how I got most of my AI knowledge and experience. To satisfy my intellectual endeavors, I spent my first college summer in Europe doing an entrepreneurship accelerator program. For my second summer, I attended an art school and learned graphic design, product design, transportation design, and 3D designs. It was three months of intensive drawing. For my last summer, I spent a whole year doing a co-op at Apple working on Siri and AI. Once I was back at school to finish my degree, I also audited various courses in Law School, including but not limited to Contract Law, Constitutional Law, Business Law - Negligence and Torts, and Criminal Law. As you can see, I really like to learn new things. Besides work, I love traveling. I have solo traveled to all 7 continents, 34 countries and counting. It's my goal to travel to a different country each year, and I am gratful for having the time and means to make those memories. I am also a recreational scuba diver, working on my pilot's license, and trying to get better at both skiing and snowboarding. Oh, I am also an amateur magician 🎩 .";

  // return biography
  //   .toLowerCase()
  //   .split(".")
  //   .forEach(async (sentence, idx) => {
  //     if (sentence.trim().length > 0) {
  //       await index.upsert(
  //         {
  //           id: idx + 1,
  //           data: sentence.trim(),
  //           metadata: {
  //             source: "personal_websie"
  //           }
  //         },
  //         {
  //           namespace: "biography"
  //         }
  //       );
  //       console.log(`added sentence id: ${idx + 1}`);
  //     }
  //   });

  // //Reset index
  // await index.reset('biography');

  //Delete a namespace
  // await index.deleteNamespace("biography");

  //Query data
  const results = await index.query(
    {
      data: "I love travelling",
      includeVectors: false,
      includeMetadata: true,
      includeData: true,
      topK: 5
    },
    {
      namespace: "biography"
    }
  );

  console.log(results);
}
