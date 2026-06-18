import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FD Arcadia Learning Hub",
  description:
    "A premium learning hub with worksheets, rewards, tuition resources, and parent progress tracking for young learners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
