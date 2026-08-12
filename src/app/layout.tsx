import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FD Arcadia Learning Hub",
  description:
    "Interactive learning portal for FD Arcadia Learning Hub.",

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },

  appleWebApp: {
    capable: true,
    title: "FD Learning Hub",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#111735",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}