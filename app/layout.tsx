import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from 'next/head';
import { Viewport } from 'next'

import "./globals.css";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { PWALifecycle } from "@/components/PWALifecycle";

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter'
});

export const viewport: Viewport = {
  themeColor: '#2D336B',
}

export const metadata: Metadata = {
  title: "DevPath - E Learning",
  description: "Empowering minds, shaping future",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/hero-pattern.svg" as="image" />
        <link rel="preload" href="/image_placeholder.webp" as="image" />
        <link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/course_placeholder.jpg" as="image" />
        <style dangerouslySetInnerHTML={{
          __html: `
            .hero-bg {
              background: linear-gradient(to right, #3b82f6, #9333ea);
            }
            .text-gradient {
              background: linear-gradient(to right, #3b82f6, #9333ea);
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
            }
          `
        }} />
      </Head>
      <html lang="en">
        <body className={inter.className}>
          <ToasterProvider />
          <ConfettiProvider>
            {children}
          </ConfettiProvider>
          <SpeedInsights />
          <PWAInstallButton />
          <PWALifecycle />
        </body>
      </html>
    </ClerkProvider>
  );
}
