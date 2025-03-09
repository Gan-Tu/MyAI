import { Button } from "@/components/base/button";
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from "@/components/base/dialog";
import { type ImageGalleryItem } from "@/lib/types";
import { capitalizeFirstLetter } from "@/lib/utils";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

interface ImageOptionsProps {
  image: ImageGalleryItem;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ImageOptions({
  image,
  isOpen,
  setIsOpen,
}: ImageOptionsProps) {
  return (
    <Dialog open={isOpen} onClose={setIsOpen} size="xl">
      <DialogTitle>Image Metadata</DialogTitle>
      <DialogDescription>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Provider</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {capitalizeFirstLetter(image.provider)}
              </dd>
            </div>
            {image.model_url && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Model URL
                </dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <Link
                    href={image.model_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer hover:text-blue-600 hover:underline"
                  >
                    {image.model_url}
                  </Link>
                </dd>
              </div>
            )}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Prompt</dt>
              <dd className="mt-1 max-h-512 overflow-scroll text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {capitalizeFirstLetter(image.prompt)}
              </dd>
            </div>
          </dl>
        </div>
      </DialogDescription>
      <DialogActions>
        <Button outline onClick={() => setIsOpen(false)}>
          Close
        </Button>
        <Button color="red" onClick={() => setIsOpen(false)}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
