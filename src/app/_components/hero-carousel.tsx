import WheelControls from "@/lib/slider-wheel-controls";
import { ImageSearchResult } from "@/lib/types";
import { capElements } from "@/lib/utils";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Link from "next/link";
import SafeImage from "./safe-image";

interface HeroCarouselProps {
  images?: ImageSearchResult[] | null;
  videoUrl?: string;
  className?: string;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  images,
  videoUrl,
  className
}) => {
  const [ref] = useKeenSlider<HTMLDivElement>(
    {
      loop: false,
      mode: "free-snap",
      slides: { perView: 1.5, spacing: 5 }
    },
    [WheelControls]
  );

  if (!images) {
    return (
      <div className="px-5 py-3">
        <div className="h-[170px] animate-pulse bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex bg-white text-5xl text-white font-medium overflow-x-auto cursor-pointer box-content ${className}`}
    >
      <div ref={ref} className="keen-slider">
        {videoUrl && !videoUrl.includes("v=example") && videoUrl !== "null" && (
          <iframe
            className="keen-slider__slide rounded-l-lg ml-5"
            height="200"
            src={videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
        {capElements(10, images).map((image, index) => {
          let imageElem = (
            <SafeImage
              key={index}
              src={image?.link}
              alt={image?.title}
              className={`keen-slider__slide object-cover w-auto aspect-auto ${
                index === 0 && !videoUrl && "ml-5 rounded-l-lg"
              } ${index === images?.length - 1 && "rounded-r-lg"}`}
              style={{
                width: image?.thumbnailWidth || "auto",
                height: image?.thumbnailHeight || 200,
                maxHeight: 200
              }}
            />
          );
          if (image?.image?.contextLink) {
            return (
              <Link
                key={index}
                href={image?.image?.contextLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {imageElem}
              </Link>
            );
          } else {
            return imageElem;
          }
        })}
      </div>
    </div>
  );
};

export default HeroCarousel;