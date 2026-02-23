/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

// Kaynaklar için renk temaları ve ikonlar
const RESOURCES = [
  {
    id: "tesbihat",
    titleKey: "tesbihatlar",
    descKey: "tesbihatlarDesc",
    href: "/resources/tesbihat",
    color: "emerald",
    icon: (
      <svg
        className="w-5 h-5 md:w-6 md:h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
    ),
  },
  {
    id: "dualar",
    titleKey: "dualar",
    descKey: "dualarDesc",
    href: "/resources/dualar",
    color: "blue",
    icon: (
      <svg
        className="w-5 h-5 md:w-6 md:h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
  {
    id: "quran",
    titleKey: "quran",
    descKey: "quranDesc",
    href: "/resources/quran",
    color: "amber",
    icon: (
      <svg
        className="w-5 h-5 md:w-6 md:h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    id: "cevsen",
    titleKey: "cevsen",
    descKey: "cevsenDesc",
    href: "/resources/cevsen",
    color: "indigo",
    icon: (
      <svg
        className="w-5 h-5 md:w-6 md:h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
];

// Tailwind'in renk sınıflarını dinamik olarak derleyebilmesi için statik sözlük
const colorStyles: any = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-800/50",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
    iconBg:
      "bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800",
    shadow: "hover:shadow-emerald-500/20",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-800/50",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
    iconBg:
      "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    shadow: "hover:shadow-blue-500/20",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-800/50",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
    iconBg:
      "bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-800",
    shadow: "hover:shadow-amber-500/20",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-100 dark:border-indigo-800/50",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
    iconBg:
      "bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800",
    shadow: "hover:shadow-indigo-500/20",
  },
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Yalnızca giriş yapmış kullanıcılar görebilir
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 py-6 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Arka Plan Dekorasyonları */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-amber-400/10 dark:bg-amber-600/10 rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/5 dark:bg-blue-600/10 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Üst Başlık Bölümü */}
        <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <Link
            href="/profile"
            className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all active:scale-95 shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              {t("myResources")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-[11px] sm:text-xs mt-0.5">
              {t("myResourcesDesc") ||
                "Manevi gelişiminizi destekleyecek kütüphaneniz."}
            </p>
          </div>
        </div>

        {/* Kaynaklar Grid Listesi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RESOURCES.map((resource) => {
            const style = colorStyles[resource.color];

            return (
              <Link
                key={resource.id}
                href={resource.href}
                className={`group relative bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl border border-transparent ${style.hoverBorder} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden`}
              >
                {/* İkon - Daha Küçük ve Ortalanmış */}
                <div
                  className={`relative z-10 w-10 h-10 md:w-12 md:h-12 ${style.iconBg} ${style.text} rounded-xl flex items-center justify-center mb-2 transition-colors duration-300`}
                >
                  {resource.icon}
                </div>

                {/* İçerik - Sadece Başlık Odaklı */}
                <div className="relative z-10 flex flex-col items-center">
                  <h2 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    {t(resource.titleKey)}
                  </h2>
                  {/* Açıklama metni sığmayacağı için çok küçük ekranlarda gizlenebilir veya çok kısa tutulabilir */}
                  <p className="hidden sm:block text-[9px] text-gray-500 dark:text-gray-400 mt-1 leading-tight line-clamp-1">
                    {t(resource.descKey)}
                  </p>
                </div>

                {/* Alt Vurgu Çizgisi (Buton yerine daha kompakt) */}
                <div
                  className={`mt-3 w-6 h-1 rounded-full ${style.text} bg-current opacity-30 group-hover:opacity-100 transition-opacity`}
                ></div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
