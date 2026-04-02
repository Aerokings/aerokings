import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AiroKing - Premium Housemaid Recruitment in Dubai",
  description: "Find experienced and reliable housemaids in Dubai. Cooks, Nannies, Caregivers, and Cleaners from verified backgrounds.",
  keywords: "housemaid, maid, dubai, recruitment, nanny, cook, cleaner, caregiver, UAE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
