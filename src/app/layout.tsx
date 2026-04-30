import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Kab — Team Tracking",
  description: "Track your team's daily output across LinkedIn, Instagram, email, and calling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
