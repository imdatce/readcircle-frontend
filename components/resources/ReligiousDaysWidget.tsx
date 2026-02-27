"use client";

import React, { useState } from "react";

// 2026 Yılı Diyanet Dini Günler Takvimi
const RELIGIOUS_DAYS_2026 = [
  { name: "Miraç Kandili", date: "15 Ocak", day: "Perşembe", type: "kandil" },
  { name: "Berat Kandili", date: "2 Şubat", day: "Pazartesi", type: "kandil" },
  {
    name: "Ramazan Başlangıcı",
    date: "19 Şubat",
    day: "Perşembe",
    type: "ramazan",
  },
  { name: "Kadir Gecesi", date: "16 Mart", day: "Pazartesi", type: "kandil" },
  {
    name: "Ramazan Bayramı Arefesi",
    date: "19 Mart",
    day: "Perşembe",
    type: "bayram",
  },
  {
    name: "Ramazan Bayramı (1. Gün)",
    date: "20 Mart",
    day: "Cuma",
    type: "bayram",
  },
  {
    name: "Kurban Bayramı Arefesi",
    date: "26 Mayıs",
    day: "Salı",
    type: "bayram",
  },
  {
    name: "Kurban Bayramı (1. Gün)",
    date: "27 Mayıs",
    day: "Çarşamba",
    type: "bayram",
  },
  { name: "Hicri Yılbaşı", date: "16 Haziran", day: "Salı", type: "diger" },
  { name: "Aşure Günü", date: "25 Haziran", day: "Perşembe", type: "diger" },
  {
    name: "Mevlid Kandili",
    date: "24 Ağustos",
    day: "Pazartesi",
    type: "kandil",
  },
  {
    name: "Üç Ayların Başlangıcı",
    date: "10 Aralık",
    day: "Perşembe",
    type: "diger",
  },
  {
    name: "Regaib Kandili",
    date: "10 Aralık",
    day: "Perşembe",
    type: "kandil",
  },
];

// Tasarım İçin İkon ve Renk Eşleştirmeleri
const TYPE_STYLES: Record<string, { icon: string; color: string; bg: string }> =
  {
    kandil: {
      icon: "🕯️",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    ramazan: {
      icon: "🌙",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    bayram: {
      icon: "✨",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    diger: {
      icon: "🗓️",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
  };

export default function ReligiousDaysWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden mt-6">
      {/* Arka Plan Işığı */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            2026 Dini Günler
            <span className="text-emerald-500 text-2xl leading-none">☪️</span>
          </h3>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
            Yılın tüm kandil, bayram ve önemli günleri.
          </p>
        </div>

        {/* AÇMA/KAPAMA BUTONU */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95"
        >
          {isOpen ? "Listeyi Gizle" : "Tümünü Gör"}
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* AÇILIR LİSTE (AKORDİYON) */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden relative z-10 ${
          isOpen ? "max-h-[1000px] opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {RELIGIOUS_DAYS_2026.map((item, index) => {
            const style = TYPE_STYLES[item.type];

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${style.bg}`}
                  >
                    {style.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base">
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.day}
                    </p>
                  </div>
                </div>

                {/* TARİH KISMI */}
                <div className="text-right">
                  <span className={`text-sm font-black ${style.color}`}>
                    {item.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
