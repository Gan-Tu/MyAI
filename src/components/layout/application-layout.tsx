import { StackedLayout } from "@/components/base/stacked-layout";
import { getShowLogin } from "@/lib/flags";
import { ReactNode } from "react";
import { MobileSidebar } from "./mobile-sidebar";
import { TopNavbar } from "./top-navbar";

export async function ApplicationLayout({ children }: { children: ReactNode }) {
  // Flags
  const showLogin = await getShowLogin();
  return (
    <StackedLayout
      navbar={<TopNavbar showLogin={showLogin} />}
      sidebar={<MobileSidebar />}
    >
      {children}
    </StackedLayout>
  );
}
