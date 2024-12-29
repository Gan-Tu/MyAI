"use client";

import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "@/components/base/navbar";
import { type NavigationProps } from "@/lib/types";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "../base/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "../base/dropdown";
import { navItems } from "./nav-items";

export function TopNavbar({ showLogin = false }: NavigationProps) {
  let pathname = usePathname();
  let showRightNav = showLogin;

  return (
    <Navbar>
      <Link href="/" aria-label="Home">
        <NavbarLabel className="cursor-pointer pl-4 font-serif font-normal">
          MyAI
        </NavbarLabel>
      </Link>
      <NavbarDivider className="max-lg:hidden" />
      {/* Left Nav Items */}
      <NavbarSection className="max-lg:hidden">
        {navItems.map(({ label, url }) => (
          <NavbarItem key={label} href={url} current={pathname === url}>
            {label}
          </NavbarItem>
        ))}
      </NavbarSection>
      <NavbarSpacer />
      {/* Right Nav Items */}
      {showRightNav && (
        <NavbarSection>
          {/* <NavbarItem href="/search" aria-label="Search">
          <MagnifyingGlassIcon />
        </NavbarItem>
        <NavbarItem href="/inbox" aria-label="Inbox">
          <InboxIcon />
        </NavbarItem> */}
          <Dropdown>
            <DropdownButton as={NavbarItem}>
              <Avatar src="/favicon.ico" className="cursor-pointer" />
            </DropdownButton>
            <DropdownMenu className="min-w-32 max-w-fit" anchor="bottom end">
              {/* <DropdownItem href="/my-profile">
              <UserIcon />
              <DropdownLabel>My profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/settings">
              <Cog8ToothIcon />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href="/privacy-policy">
              <ShieldCheckIcon />
              <DropdownLabel>Privacy policy</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/share-feedback">
              <LightBulbIcon />
              <DropdownLabel>Share feedback</DropdownLabel>
            </DropdownItem>
            <DropdownDivider /> */}
              {showLogin && (
                <DropdownItem href="/login" className="cursor-pointer">
                  <ArrowRightStartOnRectangleIcon />
                  <DropdownLabel>Log In</DropdownLabel>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </NavbarSection>
      )}
    </Navbar>
  );
}
