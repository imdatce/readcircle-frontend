"use client"; // Layout içinde buton etkileşimi olacağı için
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

// Buton Bileşeni (Layout dosyasının içinde tanımlayabiliriz)
const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition-all font-bold text-sm"
    >
      {language === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
    </button>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
          <LanguageSwitcher />
        </LanguageProvider>
      </body>
    </html>
  );
}