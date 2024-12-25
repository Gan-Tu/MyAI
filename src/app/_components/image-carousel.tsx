import { ImageSearchResult } from "@/lib/types";
import { capElements } from "@/lib/utils";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";

interface ImageCarouselProps {
  images?: ImageSearchResult[] | null;
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className }) => {
  const [ref] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "free-snap",
    slides: { perView: 2.5, spacing: 5 }
  });

  if (!images) {
    return (
      <div className="px-6 py-3">
        <div className="h-[220px] animate-pulse bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex bg-white text-5xl text-white font-medium overflow-x-auto cursor-pointer box-content ${className}`}
    >
      <div ref={ref} className="keen-slider">
        {capElements(10, images).map((image, index) => (
          <img
            key={index}
            src={image?.link}
            alt={image?.title}
            className={`keen-slider__slide object-cover w-auto aspect-auto ${
              index === 0 && "ml-6"
            }`}
            style={{
              width: image?.thumbnailWidth || "auto",
              height: image?.thumbnailHeight || 220,
              maxHeight: 220
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
