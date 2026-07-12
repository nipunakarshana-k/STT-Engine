import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STT Engine",
  description: "AI-powered speech-to-text and knowledge extraction platform.",
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
