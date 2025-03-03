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

require("dotenv").config();

function getTodayStr() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  };
  const date = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  return formattedDate;
}

async function searchGoogle(query, num = 10) {
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?q=${query.trim()}&cx=${
      process.env.GOOGLE_SEARCH_ENGINE_ID
    }&key=${process.env.GOOGLE_SEARCH_API_KEY}&num=${num}`,
  );
  if (!response.ok) {
    throw Error(`Failed to search Google: ${response.status}`);
  }
  const { items } = await response.json();
  return items.map((x) => ({
    url: x.link,
    displayLink: x.displayLink,
    title: x.title,
    snippet: x.snippet,
  }));
}

async function getPageContent(url) {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.JINA_API_KEY}`,
      "X-Base": "final",
      "X-Retain-Images": "none",
    },
  });
  // const response = await fetch(
  //   `https://urlreader.tugan.app/api/scrape?waitForTimeoutSeconds=5&url=${encodeURIComponent(url)}`,
  // );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.text();
}

async function searchAndScrape(query, count) {
  const response = await fetch("https://s.jina.ai", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.JINA_API_KEY}`,
      "Content-Type": "application/json",
      "X-Retain-Images": "none",
    },
    body: JSON.stringify({
      q: query,
      count: count,
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.text();
}

module.exports = {
  getTodayStr,
  searchGoogle,
  getPageContent,
  searchAndScrape,
};
