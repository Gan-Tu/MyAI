import { ApplicationLayout } from "@/components/layout/application-layout";
import clsx from "clsx";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "MyAI",
  description: "AI applications built by Gan Tu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={clsx("h-full antialiased", inter.variable, monaSans.variable)}
    >
      <body className="bg-muted/50">
        <Toaster position="bottom-right" />
        <div className="flex min-h-full flex-col bg-white dark:bg-gray-950">
          <ApplicationLayout>{children}</ApplicationLayout>
        </div>
      </body>
    </html>
  );
}
