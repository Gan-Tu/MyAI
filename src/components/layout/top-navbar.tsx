"use client";

import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "@/components/base/navbar";
import { useSession } from "@/hooks/session";
import { type NavigationProps } from "@/lib/types";
import {
  ArrowLeftEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/20/solid";
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

export function TopNavbar({ enableLogin = false }: NavigationProps) {
  let pathname = usePathname();
  const { user, signOut } = useSession();
  let showLogin = enableLogin && !user;
  let showLogout = user; // always allow user to sign out, if logged in
  let showDropDown = showLogin || showLogout;

  return (
    <Navbar>
      <Link href="/" aria-label="Home">
        <NavbarLabel className="cursor-pointer pl-4 font-serif font-normal">
          MyAI <small className="text-xs font-thin">by Gan</small>
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
      {showDropDown && (
        <NavbarSection>
          <Dropdown>
            <DropdownButton as={NavbarItem}>
              <Avatar
                src={user?.photoURL || "/favicon.ico"}
                className="cursor-pointer"
              />
            </DropdownButton>
            <DropdownMenu className="min-w-32 max-w-fit" anchor="bottom end">
              {/* DropdownDivider */}
              {showLogin && (
                <DropdownItem href="/login" className="cursor-pointer">
                  <ArrowLeftEndOnRectangleIcon />
                  <DropdownLabel>Log In</DropdownLabel>
                </DropdownItem>
              )}
              {showLogout && (
                <DropdownItem onClick={signOut} className="cursor-pointer">
                  <ArrowRightStartOnRectangleIcon />
                  <DropdownLabel>Sign Out</DropdownLabel>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </NavbarSection>
      )}
    </Navbar>
  );
}
