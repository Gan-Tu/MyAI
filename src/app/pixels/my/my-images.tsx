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

"use client";

import AnimatedSparkleIcon from "@/components/animated-sparkle";
import { Button } from "@/components/base/button";
import { useSession } from "@/hooks/session";
import { capitalizeFirstLetter } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getImagesByUserId } from "./actions";

interface ImageItem {
  image_url: string;
  prompt: string;
  provider: string;
  model: string;
}

export default function MyImagesView() {
  const router = useRouter();
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (user && user.uid) {
      setIsLoading(true);
      getImagesByUserId(user.uid)
        .then((data) => setImages(data as ImageItem[]))
        .catch((error) => {
          toast.error("Failed to fetch images");
          console.error(error);
        })
        .finally(() => setIsLoading(false));
    } else {
      setImages([]);
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-slate text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
            Images Gallery
          </h2>
          <p className="text-black-300 mt-6 text-lg/8">
            {user && user.uid
              ? isLoading
                ? "Loading images..."
                : images.length > 0
                  ? "Here are the images generated by you over the time, so you can reference them quickly! View your creations and prompts at ease."
                  : "You do not have any images generated right now."
              : "Please sign in to view your images"}
          </p>

          {!user && (
            <Button
              className="my-1 mt-12 ml-auto max-h-10 text-sm"
              onClick={() => router.push("/pixels")}
            >
              <AnimatedSparkleIcon className="h-3 w-3 fill-purple-400" />
              Go Generate!
            </Button>
          )}
        </div>

        <ul
          role="list"
          className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-4"
        >
          {images.map((image, i) => (
            <li key={`image-${i}`}>
              <Link
                href={image.image_url}
                className="cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={image.image_url}
                  width={280}
                  height={260}
                  alt={image.prompt || ""}
                  className="aspect-14/13 w-full rounded-2xl border object-cover"
                />
              </Link>
              <h3 className="text-slate mt-6 line-clamp-1 text-lg/8 font-semibold tracking-tight">
                {image.model.split(":")[0] ||
                  capitalizeFirstLetter(image.provider)}
              </h3>
              {/* {image.provider && (
                <p className="text-black-300 text-base/7">{image.provider}</p>
              )} */}
              {image.prompt && (
                <p className="text-black-500 prose line-clamp-4 text-sm/6 text-pretty">
                  {image.prompt}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
