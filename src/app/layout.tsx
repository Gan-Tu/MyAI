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
  variable: "--font-inter"
});

const monaSans = localFont({
  src: "../fonts/Mona-Sans.var.woff2",
  display: "swap",
  variable: "--font-mona-sans",
  weight: "200 900"
});

export const metadata: Metadata = {
  title: "AI Knowledge Card",
  description: "AI Knowledge Card by Gan"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={clsx("h-full antialiased", inter.variable, monaSans.variable)}
    >
      <body className="bg-muted/50">
        <Toaster position="top-right" />
        <main className="flex h-100vh flex-1 flex-col">
          <ApplicationLayout>{children}</ApplicationLayout>
        </main>
      </body>
    </html>
  );
}
