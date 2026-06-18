import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PMS - Next-Gen Project Management System",
  description: "Supercharge your team's productivity with PMS, a modern project management platform designed for speed, design, and seamless collaboration.",
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
