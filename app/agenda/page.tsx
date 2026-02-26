/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function AgendaPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const menuItems = [
    {
      title: "Günlük Namaz Takibi",
      description: "Beş vakit namazını takip et, huzura odaklan.",
      href: "/prayers?tab=gunluk",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-teal-500",
      lightColor: "bg-teal-50 dark:bg-teal-900/20",
      textColor: "text-teal-700 dark:text-teal-400",
    },
    {
      title: "Kaza Namazı Takibi",
      description: "Geçmiş borçlarını planla ve adım adım bitir.",
      href: "/prayers?tab=kaza",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-amber-500",
      lightColor: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    {
      title: "Hatim Yolculuğum",
      description: "Kur'an ile bağını koparma, hedefine yaklaş.",
      href: "/resources/quran",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-700 dark:text-emerald-400",
    },
    {
      title: "Günlük Zikir Takibi",
      description: "Dilini ve kalbini zikirle diri tut, virdini tamamla.",
      href: "/agenda/dhikr",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
          />
        </svg>
      ),
      color: "bg-blue-500",
      lightColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#061612] py-8 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Başlık Bölümü */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Manevi Ajandam
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Gelişimini takip et, ibadetlerini düzenle.
          </p>
        </div>

        {/* Menü Kartları Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`group relative overflow-hidden p-6 rounded-[2.5rem] border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1 ${item.lightColor}`}
            >
              <div className="flex items-start gap-5">
                {/* İkon Kutusu */}
                <div
                  className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500 shrink-0`}
                >
                  {item.icon}
                </div>

                <div className="space-y-1">
                  <h3 className={`text-xl font-black ${item.textColor}`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Sağ Alt Dekoratif Ok */}
              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                <svg
                  className={`w-6 h-6 ${item.textColor}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Alt Bilgi veya Motivasyon Sözü */}
        <div className="pt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              İstikrar Başarının Anahtarıdır
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
