/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

const colorStyles: any = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-800/50",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
    iconBg:
      "bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-800/50",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
    iconBg:
      "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-800/50",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
    iconBg:
      "bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-800",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-100 dark:border-indigo-800/50",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
    iconBg:
      "bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-100 dark:border-rose-800/50",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700",
    iconBg:
      "bg-rose-100 dark:bg-rose-900/40 group-hover:bg-rose-200 dark:group-hover:bg-rose-800",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-800/50",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700",
    iconBg:
      "bg-violet-100 dark:bg-violet-900/40 group-hover:bg-violet-200 dark:group-hover:bg-violet-800",
  },
};

export default function ResourcesPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const RESOURCES = useMemo(
    () => [
      {
        id: "quran",
        title: t("quran") || "Kur'an-ı Kerim",
        desc: t("quranDesc") || "Kutsal Kitabımız",
        href: "/resources/quran",
        color: "amber",
        image: "/background/library/quran-card.jpg",
      },
      {
        id: "cevsen",
        title: t("cevsen") || "Cevşen",
        desc: t("cevsenDesc") || "Peygamber Efendimizin Duası",
        href: "/resources/cevsen",
        color: "indigo",
        image: "/background/library/cevsen-card.jpg",
      },
      {
        id: "risale",
        title: t("risale") || "Risale-i Nur",
        desc: t("risaleDesc") || "Bedüzzaman Said Nursi'nin eserleri",
        href: "/resources/risale",
        color: "rose",
        image: "/background/library/risale-card.jpg",
      },
      {
        id: "tesbihat",
        title: t("tesbihatlar") || "Tesbihatlar",
        desc: t("tesbihatlarDesc") || "Namaz sonrası tesbihatlar",
        href: "/resources/tesbihat",
        color: "emerald",
        image: "/background/library/tesbihat-card.jpg",
      },
      {
        id: "dualar",
        title: t("dualar") || "Dualar ve Virdler",
        desc: t("dualarDesc") || "Çeşitli dua ve zikirler",
        href: "/resources/dualar",
        color: "blue",
        image: "/background/library/dualar-card.jpg",
      },
    ],
    [t],
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 py-6 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-amber-400/10 dark:bg-amber-600/10 rounded-full blur-3xl opacity-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/5 dark:bg-blue-600/10 rounded-full blur-3xl opacity-50 pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Üst Başlık Bölümü */}
        <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => router.push("/")}
            className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all active:scale-95 shrink-0"
            title={t("backHome") || "Ana Sayfa"}
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
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              {t("myResources") || "Kaynaklarım"}
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
                className={`group relative bg-white dark:bg-gray-900 p-0 rounded-[2rem] border border-transparent ${style.hoverBorder} shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden h-full`}
              >
                {/* Resim Alanı */}
                {resource.image && (
                  <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                    <Image
                      src={resource.image}
                      alt={resource.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Renkli Overlay: Kartın rengine göre hafif bir ton verir */}
                    <div
                      className={`absolute inset-0 opacity-20 ${style.bg}`}
                    ></div>
                  </div>
                )}

                {/* Metin İçeriği */}
                <div className="p-4 flex flex-col items-center text-center flex-grow">
                  <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight mt-2">
                    {resource.title}
                  </h2>
                  <p className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-tight line-clamp-2">
                    {resource.desc}
                  </p>

                  {/* Dekoratif Çizgi */}
                  <div
                    className={`mt-auto pt-3 w-8 h-1 rounded-full ${style.text} bg-current opacity-30 group-hover:opacity-100 transition-opacity`}
                  ></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
