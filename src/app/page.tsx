import { ColorThemeProvider } from "@/hooks/color-theme";
import { ResetExpansionProvider } from "@/hooks/reset-expansion";
import { supportedModels } from "@/lib/models";
import AiTopics from "./ai-topics";

export const metadata = {
  title: "AI Knowledge - MyAI",
  description:
    "AI Knowledge is your on-demand LLM-powered topic card generator. Just ask a question, and it serves up a sleek, concise card packed with a title, subtitle, description, key facts, and even hero videos and images.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q, model: modelParam } = await searchParams;
  const model = Array.isArray(modelParam)
    ? modelParam.length > 0
      ? modelParam[0]
      : undefined
    : modelParam;
  const query = Array.isArray(q) ? (q.length > 0 ? q[0] : undefined) : q;
  let defaultModel: string | undefined = model;
  if (!supportedModels.includes(defaultModel ?? "")) {
    defaultModel = undefined;
  }
  return (
    <ResetExpansionProvider>
      <ColorThemeProvider>
        <AiTopics q={query} defaultModel={defaultModel} />
      </ColorThemeProvider>
    </ResetExpansionProvider>
  );
}
