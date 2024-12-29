import { entityCardSchemaType, ImageSearchResult } from "@/lib/types";
import { capElements } from "@/lib/utils";
import clsx from "clsx";
import CreditFooter from "./credit-footer";
import Description from "./description";
import FactsList from "./fact-list";
import Header from "./header";
import HeroCarousel from "./hero-carousel";

interface AiCardProps {
  card: Partial<entityCardSchemaType>;
  hideHero: boolean;
  images?: ImageSearchResult[] | null;
  className?: string;
}

export default function AiCard({
  card,
  hideHero,
  images,
  className,
}: AiCardProps) {
  return (
    <div
      className={clsx(
        "flex flex-col content-center justify-center overflow-scroll",
        className,
      )}
    >
      <div className="my-auto rounded-2xl bg-white">
        <div className="max-w-xl rounded-lg bg-white shadow-inner drop-shadow-md">
          <Header title={card?.title} subtitle={card?.subtitle} />
          {!hideHero && (
            <HeroCarousel images={images} videoUrl={card?.video?.url} />
          )}
          <Description
            className={hideHero ? "pt-0" : ""}
            description={card?.description}
            highlighting={card?.highlighting}
          />
          <FactsList
            className={card?.description ? "pt-3" : "pt-0"}
            facts={capElements(3, card?.facts)}
          />
        </div>
      </div>

      <CreditFooter className="mt-4 justify-end bg-transparent lg:hidden" />
    </div>
  );
}
