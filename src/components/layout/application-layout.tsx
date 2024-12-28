import { StackedLayout } from "@/components/base/stacked-layout";
import { ReactNode } from "react";
import { DesktopNavbar } from "./desktop-navbar";
import { MobileSidebar } from "./mobile-sidebar";

export function ApplicationLayout({ children }: { children: ReactNode }) {
  return (
    <StackedLayout navbar={<DesktopNavbar />} sidebar={<MobileSidebar />}>
      {children}
    </StackedLayout>
  );
}
