import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";

import { AppChrome } from "@/components/app-chrome";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "AutoFlow",
  description: "Visual workflow automation builder with realtime execution logs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${jetbrainsMono.variable}`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
