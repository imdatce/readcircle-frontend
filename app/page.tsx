"use client"; // Hook kullandığımız için bu satır ŞART

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext"; // Dil kancasını çağır

export default function Home() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative">

      {/* SAĞ ÜST KÖŞE: DİL DEĞİŞTİRME BUTONU */}
      <button
        onClick={toggleLanguage}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all font-bold text-sm shadow-sm border"
      >
        {language === 'tr' ? '🇬🇧 English' : '🇹🇷 Türkçe'}
      </button>

      {/* BAŞLIK (Sözlükten geliyor) */}
      <h1 className="text-4xl font-bold text-center">{t('title')}</h1>

      {/* ALT BAŞLIK */}
      <p className="mt-4 text-xl text-center text-gray-600">{t('subtitle')}</p>

      {/* ADMIN BUTONU */}
      <Link
        href="/admin"
        className="mt-8 p-4 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors cursor-pointer font-medium"
      >
        {t('adminButton')}
      </Link>
    </main>
  );
}