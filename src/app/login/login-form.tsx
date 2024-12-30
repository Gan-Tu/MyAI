"use client";

import { Avatar } from "@/components/base/avatar";
import { Link } from "@/components/base/link";
import { type LogInButtonProps } from "@/lib/types";
import toast from "react-hot-toast";
import { LogInButton } from "./login-button";

const loginProviders: LogInButtonProps[] = [
  {
    logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
    textColor: "text-gray-900",
    bgColor: "bg-gray-100",
    buttonText: "Sign in with Google",
    provider: "Google",
  },
  {
    logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg",
    textColor: "text-white",
    bgColor: "bg-facebook-blue",
    buttonText: "Sign in with Facebook",
    provider: "Facebook",
  },
  {
    logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/twitter.svg",
    textColor: "text-white",
    bgColor: "bg-twitter-blue",
    buttonText: "Sign in with Twitter",
    provider: "Twitter",
  },
  {
    logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg",
    textColor: "text-white",
    bgColor: "bg-github-black",
    buttonText: "Sign in with GitHub",
    provider: "GitHub",
  },
  {
    logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg",
    textColor: "text-white",
    bgColor: "bg-google-red",
    buttonText: "Sign in with Email",
    provider: "Email",
  },
  {
    logo: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png",
    textColor: "text-white",
    bgColor: "bg-google-green",
    buttonText: "Sign in as Guest",
    provider: "Guest",
  },
];

export function LoginForm() {
  const onLogIn = async (provider: string) => {
    toast.error(`Sign in with ${provider} is not implemented yet.`);
  };

  return (
    <div className="p-10">
      <div className="flex items-start">
        <Link href="/" title="Home">
          <Avatar src="/favicon.ico" className="h-8 w-8" />
        </Link>
      </div>
      <h1 className="mt-8 text-base/6 font-medium dark:text-zinc-950">
        Welcome!
      </h1>
      <p className="mt-1 text-sm/5 text-gray-600">
        Sign in to your account to continue.
      </p>
      <div className="grid grid-cols-1 justify-items-center">
        <ul className="my-5 space-y-3">
          {loginProviders.map((button, index) => (
            <li key={index}>
              <LogInButton
                logo={button.logo}
                textColor={button.textColor}
                bgColor={button.bgColor}
                buttonText={button.buttonText}
                provider={button.provider}
                onClick={() => onLogIn(button.provider)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
