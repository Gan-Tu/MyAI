import { ResetExpansionProvider } from "@/hooks/reset-expansion";
import { supportedLanguageModels } from "@/lib/models";
import ClaimsPage from "./claims";

export const metadata = {
  title: "Claims Extractor",
  description:
    "Claim Extractor is your AI-powered factual claims breakdown tool. Provide any text, and it instantly extracts individual factual claims, in clear and concise sentences for analysis or review.",
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
  if (!supportedLanguageModels.includes(defaultModel ?? "")) {
    defaultModel = undefined;
  }
  return (
    <ResetExpansionProvider>
      <div className="place-content-center p-6">
        <ClaimsPage
          q={query}
          defaultModel={defaultModel}
        />
      </div>
    </ResetExpansionProvider>
  );
}
