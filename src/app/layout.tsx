import { ApplicationLayout } from "@/components/layout/application-layout";
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
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}
