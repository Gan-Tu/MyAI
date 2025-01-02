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

import { capitalizeFirstLetter } from "@/lib/utils";
import Loader from "./loader";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="items-center p-5 min-w-[140px]">
      {title ? (
        <h1 className="text-lg font-bold text-gray-900">
          {capitalizeFirstLetter(title)}
        </h1>
      ) : (
        <Loader className="min-h-6 w-[160px] col-span-2" />
      )}
      {subtitle ? (
        <p className="text-sm text-gray-600">
          {capitalizeFirstLetter(subtitle)}
        </p>
      ) : !title ? (
        <Loader className="min-h-6 mt-1 w-[120px] col-span-2" />
      ) : null}
    </div>
  );
}
