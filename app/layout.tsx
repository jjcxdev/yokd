import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { Toaster } from "@/components/ui/toaster";

import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";
import { AuthWrapper } from "./components/AuthWrapper";

const helvObl = localFont({
  src: "./fonts/Helv_Black_Ob.woff",
  variable: "--font-helv-ob",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#7233F3",
};

export const metadata: Metadata = {
  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/icon-192x192.png" },
      { url: "/icons/icon-512x512.png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  title: "YOKD",
  description: "Workout Tracker",
  creator: "jjcx",
  openGraph: {
    title: "YOKD",
    description: "Your personal workout tracker",
    url: "https://yokd.xyz",
    siteName: "YOKD",
    images: [
      {
        url: "https://github.com/jjcxdev/yokd/blob/main/public/og.png",
        width: 1600,
        height: 840,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "YOKD",
    description: "Your persona workout tracker",
    creator: "jjcx",
    images: ["https://github.com/jjcxdev/yokd/blob/main/public/og.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl={"/"} appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className={`${inter.className} ${helvObl.variable} antialiased`}>
          <AuthWrapper>
            {children}
            <Toaster />
            <ServiceWorkerRegistration />
            <PWAInstallPrompt />
          </AuthWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
