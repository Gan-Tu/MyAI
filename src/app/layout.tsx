import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Knowledge",
  description: "AI Knowledge Card by Gan"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-muted/50`}>
        <Toaster position="top-right" />
        <main className="flex h-100vh flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
