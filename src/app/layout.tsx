import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Tweet/Garot Subcontractor Portal",
  description: "Pre-qualification with REAL OCR + COI analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {children}
      </body>
    </html>
  );
}

