"use client";

import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "@/components/base/sidebar";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

export function MobileSidebar() {
  let pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarLabel className="cursor-pointer font-serif font-normal">
          MyAI
        </SidebarLabel>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          {navItems.map(({ label, url }) => (
            <SidebarItem key={label} href={url} current={pathname === url}>
              {label}
            </SidebarItem>
          ))}
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}
