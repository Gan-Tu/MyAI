/** @type {import('next').NextConfig} */
const nextConfig = {
  // Config options here
  async headers() {
    return [
      {
        source: "/api/stripe/credits/webhook",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // or "https://your-allowed-domain.com"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "POST, HEAD, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

const withVercelToolbar = require("@vercel/toolbar/plugins/next")();
// Instead of module.exports = nextConfig, do this:
module.exports = withVercelToolbar(nextConfig);
