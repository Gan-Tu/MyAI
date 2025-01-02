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

import { ApplicationLayout } from "@/components/layout/application-layout";
import { CreditsProvider } from "@/hooks/credits";
import { SessionProvider } from "@/hooks/session";
import { getEnableCredits } from "@/lib/flags";
import { VercelToolbar } from "@vercel/toolbar/next";
import clsx from "clsx";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const monaSans = localFont({
  src: "../fonts/Mona-Sans.var.woff2",
  display: "swap",
  variable: "--font-mona-sans",
  weight: "200 900",
});

export const metadata = {
  title: {
    template: "%s - MyAI",
    default: "MyAI",
  },
  description: "AI applications built by Gan Tu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development";
  const enableCredits = await getEnableCredits();
  return (
    <html
      lang="en"
      className={clsx("h-full antialiased", inter.variable, monaSans.variable)}
    >
      <body className="bg-muted/50">
        <Toaster position="bottom-right" />
        <div className="flex min-h-full flex-col bg-white dark:bg-gray-950">
          <SessionProvider>
            <CreditsProvider enableCredits={enableCredits}>
              <ApplicationLayout>{children}</ApplicationLayout>
            </CreditsProvider>
          </SessionProvider>
        </div>
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}
