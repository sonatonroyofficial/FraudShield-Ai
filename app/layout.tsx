import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionRoot from "@/components/MotionRoot";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const hind = Hind_Siliguri({ subsets: ["bengali"], weight: ["400", "500", "600", "700"], variable: "--font-hind" });

export const metadata: Metadata = {
  title: "FraudShield AI — Detect. Understand. Prevent. Protect.",
  description: "Check suspicious messages, links and screenshots in English, বাংলা or Banglish. Evidence-based, calm and private fraud protection.",
};
export const viewport: Viewport = { themeColor: "#f6f4ee" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable} ${hind.variable}`}>
      <body className="min-h-screen overflow-x-hidden" suppressHydrationWarning>
        <LangProvider>
          <MotionRoot>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </MotionRoot>
        </LangProvider>
      </body>
    </html>
  );
}
