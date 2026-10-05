import "dotenv/config";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '@fontsource-variable/dm-sans';
import "./globals.css";
import Provider from "@/components/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Pal",
  description: "Stay on top of your stocks",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Provider>
        <body className="min-h-full flex flex-col" style={{
          backgroundColor: "var(--paper)"
        }}>{children}</body>
      </Provider>
    </html>
  );
}
