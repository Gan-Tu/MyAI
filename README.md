# 🚀 MyCool.AI – AI-Powered Knowledge & Creativity Tools

MyCool.AI is a suite of AI-driven tools designed to generate knowledge, extract insights, and enhance creativity—all in a sleek and intuitive interface. Whether you need AI-generated topic cards, factual claims extraction, or stunning AI-crafted visuals, MyCool.AI has you covered.

🌐 **Live:** [mycool.ai](https://mycool.ai/)

## ✨ Features

### 📚 AI Knowledge

Just ask a question, and our LLM-powered engine serves up a **sleek, concise topic card** with a title, subtitle, description, key facts, and even hero videos & images.

### 🔍 Claims Extractor

Break down any text into **clear and concise factual claims** for easy analysis and review.

### 🏛️ Citation Necessity

Evaluate your text’s credibility! Identify which sentences **need citations** to ensure academic and professional rigor.

### 🎨 Pixel Crafter

Turn your ideas into breathtaking **AI-generated visuals** in any style—from hyper-realistic designs to artistic masterpieces.

#### 🖼️ My Images

View and manage the images you've generated over time. Quickly reference your creations and prompts at ease.

### 🌎 Web Summarizer

Summarize any web page in seconds. Get **clear, concise summaries** of articles, blogs, and research papers for quick understanding.

## 🛠️ Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Firebase** for authentication
- **Stripe** for payment
- **Upstash** for caching
- **Neon** for database
- **Vercel** for hosting
- **Vercel Blob** for storing files and images
- **AI SDK** for LLM integration
- **Resend** for email
- **React Email** for email templates
- more...

## 💡 Contributing

We welcome contributions! Feel free to submit a PR or open an issue.

## 📜 License

This project is licensed under the Apache-2.0 License – see the LICENSE file for details.

## Search configuration

Web grounding and image search use the existing server-side `OPENAI_API_KEY`.
Google Custom Search credentials are no longer used. See
[search migration and verification](docs/search-migration.md) for response
compatibility, configuration, cache behavior and rollout checks.
