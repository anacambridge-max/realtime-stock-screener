import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real-Time Stock Scanner | Upstox Live Data",
  description: "Advanced real-time stock scanner with Chartink-style logic using live Upstox API data for NSE F&O stocks.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
