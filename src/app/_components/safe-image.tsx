// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
