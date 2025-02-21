import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { PWALifecycle } from "@/components/PWALifecycle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevPath - E Learning",
  description: "Empowering minds, shaping future",
  manifest: "/manifest.json",
  themeColor: "#2D336B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
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
