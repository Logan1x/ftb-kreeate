import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kreeate - Bug Report & Feature Request",
  description: "Submit bug reports and feature requests with AI-generated GitHub issues",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Kreeate - Bug Report & Feature Request",
    description: "Submit bug reports and feature requests with AI-generated GitHub issues",
    type: "website",
    siteName: "Kreeate",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kreeate - Bug Report & Feature Request",
    description: "Submit bug reports and feature requests with AI-generated GitHub issues",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
