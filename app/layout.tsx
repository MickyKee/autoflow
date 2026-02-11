import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { AppChrome } from "@/components/app-chrome";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "AutoFlow",
  description: "Visual workflow automation builder — design, execute, and monitor data pipelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
