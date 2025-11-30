import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["vietnamese", "latin"],
  variable: "--font-noto",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Secure Docs Management Application",
  description: "Quản lý tài liệu an toàn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Material Icons - allowed per requirements */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body
        className={`${notoSans.variable} font-sans antialiased`}
      >
        <div className="h-screen overflow-hidden bg-zinc-100 text-zinc-900">
          {children}
        </div>
      </body>
    </html>
  );
}
