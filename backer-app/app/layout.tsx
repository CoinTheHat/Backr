import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backr - Creator Tipping on Tempo",
  description: "Next Gen Creator Tipping Platform on Tempo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/rocket-favicon.svg" type="image/svg+xml" />
        <link rel="preload" as="image" href="/backgrounds/hero-bg-simple.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
