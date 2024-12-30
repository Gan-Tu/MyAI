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
