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
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
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

export function TopNavbar({
  enableLogin = false,
  enableCredits = false,
}: NavigationProps) {
  let pathname = usePathname();
  const { user, gravatarUrl, signOut } = useSession();
  const { balance, isLoading: isCreditsLoading } = useCredits();
  const router = useRouter();
  let showLogin = enableLogin && !user;
  let showLogout = user; // always allow user to sign out, if logged in
  let showDropDown = showLogin || showLogout;

  const onBuyCredits = async () => {
    if (!user) {
      toast.error("Please sign in before buying credits");
      return;
    }
    try {
      const response = await fetch("/api/stripe/credits/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const { checkoutUrl, error } = await response.json();
      if (error) {
        toast.error(error);
      } else if (!checkoutUrl) {
        toast.error("Internal error");
        console.log("Missing checkout url from checkout api");
      } else {
        router.push(checkoutUrl);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to buy credits: ${(error as Error).message}`);
    }
  };

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
              {!isCreditsLoading && enableCredits && (
                <DropdownSection>
                  <DropdownHeader>
                    <div className="text-pretty text-sm text-zinc-500 dark:text-zinc-400">
                      You have{" "}
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {Math.max(balance, 0)}{" "}
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
                  {enableCredits && user && (
                    <DropdownItem
                      onClick={onBuyCredits}
                      className="cursor-pointer"
                    >
                      <CurrencyDollarIcon className="h-6 w-6" />
                      <DropdownLabel>Buy 100 Credits</DropdownLabel>
                    </DropdownItem>
                  )}
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
