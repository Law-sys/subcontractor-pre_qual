import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: "Tweet/Garot Subcontractor Portal",
  description: "Pre-qualification with REAL OCR + COI analysis",
  keywords: "subcontractor, pre-qualification, COI, OCR, insurance, certificate",
  authors: [{ name: "Tweet/Garot Mechanical" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 font-sans">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

