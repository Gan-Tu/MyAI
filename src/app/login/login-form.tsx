"use client";

import { Link } from "@/components/base/link";
import { Mark } from "@/components/logo";
import { useSession } from "@/hooks/session";
import { LoginOption, loginWithProvider } from "@/lib/session";
import { type LogInButtonProps } from "@/lib/types";
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailForm } from "./email-form";
import { LogInButton } from "./login-button";

export function LoginForm() {
  const [openEmailForm, setOpenEmailForm] = useState(false);
  const { isLoading, user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  const loginProviders: LogInButtonProps[] = [
    {
      logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
      textColor: "text-gray-900",
      bgColor: "bg-gray-100",
      buttonText: "Sign in with Google",
      provider: LoginOption.GOOGLE,
      async onClick() {
        loginWithProvider(new GoogleAuthProvider());
      },
    },
    {
      logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg",
      textColor: "text-white",
      bgColor: "bg-github-black",
      buttonText: "Sign in with GitHub",
      provider: LoginOption.GITHUB,
      async onClick() {
        loginWithProvider(new GithubAuthProvider());
      },
    },
    {
      logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg",
      textColor: "text-white",
      bgColor: "bg-facebook-blue",
      buttonText: "Sign in with Email",
      provider: LoginOption.EMAIL,
      async onClick() {
        setOpenEmailForm(true);
      },
    },
  ];

  return (
    <div className="p-10">
      <div className="flex items-start">
        <Link href="/" title="Home">
          <Mark className="h-8 fill-black" />
        </Link>
      </div>
      <h1 className="mt-8 text-base/6 font-medium dark:text-zinc-950">
        Welcome!
      </h1>
      <p className="mt-1 text-sm/5 text-gray-600">
        Sign in to your account to continue.
      </p>
      <EmailForm isOpen={openEmailForm} setIsOpen={setOpenEmailForm} />
      <div className="grid grid-cols-1 justify-items-center">
        <ul className="my-5 space-y-3">
          {loginProviders.map((button, index) => (
            <li key={index}>
              <LogInButton
                logo={button.logo}
                textColor={button.textColor}
                bgColor={button.bgColor}
                buttonText={button.buttonText}
                onClick={button.onClick}
              />
            </li>
          ))}
        </ul>
        <div className="w-full rounded-md bg-green-50 p-4">
          <h3 className="text-center text-sm font-medium text-green-800">
            New members get 20 free credits!
          </h3>
        </div>
      </div>
    </div>
  );
}
