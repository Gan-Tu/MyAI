"use client";

import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "@/components/base/navbar";
import { useCredits } from "@/hooks/credits";
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
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSection,
} from "../base/dropdown";
import { navItems } from "./nav-items";

export function TopNavbar({ enableLogin = false }: NavigationProps) {
  let pathname = usePathname();
  const { user, gravatarUrl, signOut } = useSession();
  const { balance, isLoading: isCreditsLoading } = useCredits();
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
                src={user?.photoURL || gravatarUrl || "/favicon.ico"}
                className="cursor-pointer"
              />
            </DropdownButton>
            <DropdownMenu className="min-w-32 max-w-fit" anchor="bottom end">
              {user && (
                <DropdownSection>
                  <DropdownHeader>
                    <div className="">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Signed in as {user.displayName && `${user.displayName}`}
                      </div>
                      {user.email && (
                        <div className="text-sm/7 font-semibold text-zinc-800 dark:text-white">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </DropdownHeader>
                  <DropdownDivider />
                </DropdownSection>
              )}
              {!isCreditsLoading && (
                <DropdownSection>
                  <DropdownHeader>
                    <div className="text-pretty text-sm text-zinc-500 dark:text-zinc-400">
                      You have{" "}
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {balance}{" "}
                      </span>
                      credit{balance > 1 && "s"} left
                      <br />
                      {!user && (
                        <div className="mt-2 text-pretty italic text-zinc-600">
                          Sign in to get free credits!
                        </div>
                      )}
                    </div>
                  </DropdownHeader>
                  <DropdownDivider />
                </DropdownSection>
              )}
              <DropdownSection>
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
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarSection>
      )}
    </Navbar>
  );
}
