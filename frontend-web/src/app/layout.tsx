import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import WagmiProviderWrapper from "@/components/wagmi-provider";
import { SelectedFileProvider } from "@/contexts/SelectedFileContext";
import { UnifiedSidebarProvider } from "@/contexts/UnifiedSidebarContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Docs - Cloud Storage",
  description: "Secure document storage and sharing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WagmiProviderWrapper>
          <UnifiedSidebarProvider>
            <SelectedFileProvider>{children}</SelectedFileProvider>
          </UnifiedSidebarProvider>
        </WagmiProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
