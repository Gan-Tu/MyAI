/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width = "auto",
  height = 200,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null; // Don't render anything if the image is broken

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setIsVisible(false)} // Hide the image if it fails to load
      {...props}
    />
  );
};

export default SafeImage;
