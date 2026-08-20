import type { Metadata } from "next";
import { Inter, Chakra_Petch, Space_Mono } from "next/font/google";
import "./globals.css";

const inter        = Inter({ subsets: ["latin"], variable: "--font-sans" });
const chakraPetch  = Chakra_Petch({ subsets: ["latin"], variable: "--font-display", weight: ["400","600","700"] });
const spaceMono    = Space_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","700"] });

export const metadata: Metadata = {
  title: "SOVA Protocol — Verifiable Reputation for Onchain Finance",
  description: "Turn your onchain history into a verifiable, privacy-preserving credit score. Built natively on Whitechain L2.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${chakraPetch.variable} ${spaceMono.variable} antialiased`}>
      <body style={{ background: "#fff", color: "#0A0A0A", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
