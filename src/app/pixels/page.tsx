import { ResetExpansionProvider } from "@/hooks/reset-expansion";
import { VISION_MODELS } from "@/lib/models";
import PixelsPage from "./pixels";

export const metadata = {
  title: "Pixel Crafter",
  description:
    "Transform your ideas into breathtaking visuals with PixelCrafter, the AI-powered tool that generates stunning images in any style. From hyper-realistic designs to artistic masterpieces, PixelCrafter brings your imagination to life effortlessly.",
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
  if (!VISION_MODELS.hasOwnProperty(defaultModel ?? "")) {
    defaultModel = undefined;
  }
  return (
    <ResetExpansionProvider>
      <div className="place-content-center p-6">
        <PixelsPage q={query} defaultModel={defaultModel} />
      </div>
    </ResetExpansionProvider>
  );
}
