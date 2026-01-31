"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative">
      <h1 className="text-4xl font-bold text-center">{t('title')}</h1>
      <p className="mt-4 text-xl text-center text-gray-600">{t('subtitle')}</p>
      <Link
        href="/admin"
        className="mt-8 p-4 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors cursor-pointer font-medium"
      >
        {t('adminButton')}
      </Link>
    </main>
  );
}