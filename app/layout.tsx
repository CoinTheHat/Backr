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
  title: "Backr",
  description: "Next Gen Membership Platform on Mantle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/backr-logo-galaxy.png" type="image/png" />
        <link rel="preload" as="image" href="/backgrounds/hero-bg.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
