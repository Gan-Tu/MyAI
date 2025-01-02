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

import { StackedLayout } from "@/components/base/stacked-layout";
import { getEnableCredits, getEnableLogin } from "@/lib/flags";
import { ReactNode } from "react";
import { MobileSidebar } from "./mobile-sidebar";
import { TopNavbar } from "./top-navbar";

export async function ApplicationLayout({ children }: { children: ReactNode }) {
  // Flags
  const enableLogin = await getEnableLogin();
  const enableCredits = await getEnableCredits();
  return (
    <StackedLayout
      navbar={
        <TopNavbar enableLogin={enableLogin} enableCredits={enableCredits} />
      }
      sidebar={<MobileSidebar />}
    >
      {children}
    </StackedLayout>
  );
}
