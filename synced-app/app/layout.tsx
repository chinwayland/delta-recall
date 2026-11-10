import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DELTA Recall — your practice, across devices",
  description: "Private DELTA Module One flashcards with saved review dates and sessions across your devices.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
