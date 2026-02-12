import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SURA - Spiritual Union",
  description: "Resource Distribution Platform for Spiritual Union for Reflection & Affinity "
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-900 dark:text-gray-100 relative`}
      >
        <div className="fixed inset-0 -z-50 h-full w-full bg-[#f0f4f8] dark:bg-[#020617] transition-colors duration-300">
          <div
            className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          ></div>

          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/25 dark:bg-emerald-600/20 rounded-full blur-[120px] opacity-60 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/25 dark:bg-blue-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-amber-400/20 dark:bg-amber-600/15 rounded-full blur-[100px] opacity-40 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-emerald-100/30 dark:to-emerald-950/40 pointer-events-none"></div>
        </div>

        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <div className="flex flex-col min-h-screen relative z-10">
                <Header />
                <main className="flex-grow w-full">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
