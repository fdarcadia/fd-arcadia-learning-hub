import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FD Arcadia Learning Hub",
  description: "A cheerful learning portal for parents and children.",
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
