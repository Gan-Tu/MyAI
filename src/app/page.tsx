import { ResetExpansionProvider } from "@/hooks/reset-expansion";
import AiTopics from "./ai-topics";

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? (q.length > 0 ? q[0] : undefined) : q;

  return (
    <ResetExpansionProvider>
      <AiTopics q={query} />
    </ResetExpansionProvider>
  );
}
