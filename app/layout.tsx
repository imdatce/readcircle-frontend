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
  title: "Read Circle",
  description: "Distribution Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              {" "}
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow w-full">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>{" "}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
