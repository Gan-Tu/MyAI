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

import {
    Combobox,
    ComboboxInput,
    Dialog,
    DialogBackdrop,
    DialogPanel
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

type SearchBoxProps = {
  initiallyOpen?: boolean;
};

export default function SearchBox({ initiallyOpen = false }: SearchBoxProps) {
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(initiallyOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toLowerCase() === "k") {
        event.preventDefault(); // Prevent default browser behavior (if any)
        setOpen(true);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Dialog
      className="relative z-10"
      open={open}
      onClose={() => {
        // setOpen(false);
        setQuery(""); // cannot close
      }}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/25 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-4 sm:p-5 md:p-20 grow">
        <DialogPanel
          transition
          className="w-full mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
        >
          <Combobox>
            <div className="grid grid-cols-1">
              <ComboboxInput
                autoFocus
                className="col-start-1 row-start-1 h-12 w-full pl-11 pr-4 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-sm"
                placeholder="Type something to chat..."
                onChange={event => setQuery(event.target.value)}
                onBlur={() => setQuery("")}
              />
              <MagnifyingGlassIcon
                className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-400"
                aria-hidden="true"
              />
            </div>
            {query !== "" &&
              <p className="p-4 text-sm text-gray-500">
                The service is offline right now.
              </p>}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
