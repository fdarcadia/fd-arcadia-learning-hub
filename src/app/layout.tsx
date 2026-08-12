import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FD Arcadia Learning Hub",
  description: "Parent portal for FD Arcadia.",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png"
      }
    ]
  },

  appleWebApp: {
    capable: true,
    title: "FD Learning Hub",
    statusBarStyle: "default"
  }
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
