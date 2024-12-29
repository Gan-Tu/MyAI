import WheelControls from "@/lib/slider-wheel-controls";
import { ImageSearchResult } from "@/lib/types";
import clsx from "clsx";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Link from "next/link";
import Loader from "./loader";
import SafeImage from "./safe-image";

interface HeroCarouselProps {
  images?: ImageSearchResult[] | null;
  videoUrl?: string;
  className?: string;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  images,
  videoUrl,
  className,
}) => {
  const [ref] = useKeenSlider<HTMLDivElement>(
    {
      loop: false,
      mode: "snap",
      slides: { perView: 1.5, spacing: 5 },
    },
    [WheelControls],
  );
  const showVideo =
    videoUrl && !videoUrl.includes("v=example") && videoUrl !== "null";
  const showImages = images && images.length > 0;
  const videoOnly = showVideo && !showImages;

  if (!showImages && !showVideo) {
    return (
      <div className="px-5 py-3">
        <Loader className="h-[170px]" />
      </div>
    );
  }

  return (
    <div
      className={`relative box-content flex cursor-pointer overflow-x-auto bg-white text-5xl font-medium text-white ${className}`}
    >
      {videoOnly ? (
        <iframe
          height="238"
          width="424"
          src={videoUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="mx-5 min-w-fit rounded-l-lg rounded-r-lg"
        />
      ) : (
        <div ref={ref} className="keen-slider">
          <div
            className={clsx(
              "keen-slider__slide ml-5 min-w-fit rounded-l-lg",
              !showVideo && "hidden",
            )}
          >
            {showVideo && (
              <iframe
                height={videoOnly ? "238" : "200"}
                width={videoOnly ? "424" : "auto"}
                src={videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}
          </div>
          {showImages &&
            images?.map((image, index) => {
              let imageElem = (
                <SafeImage
                  key={index}
                  src={image?.link}
                  alt={image?.title}
                  className={`keen-slider__slide aspect-auto w-auto object-cover ${
                    index === 0 && !showVideo && "ml-4 rounded-l-lg"
                  } ${index === images?.length - 1 && "rounded-r-lg"}`}
                  style={{
                    width: image?.thumbnailWidth || "auto",
                    height: image?.thumbnailHeight || 200,
                    maxHeight: 200,
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
      )}
    </div>
  );
};

export default HeroCarousel;
