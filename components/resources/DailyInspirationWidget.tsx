/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

// Toplam gün sayısını buraya yazıyoruz (Dil dosyasındaki veri sayınız)
const TOTAL_DAYS = 20;

export default function DailyInspirationWidget() {
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Yılın kaçıncı gününde olduğumuzu anlık olarak hesapla
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff =
    now.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Günü TOTAL_DAYS'e bölerek kalanı bul (0 ile 19 arası bir indeks döner)
  const index = dayOfYear % TOTAL_DAYS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* GÜNÜN AYETİ KARTI */}
      <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-3xl p-5 shadow-sm border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              📖
            </span>
            <h4 className="font-black text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">
              {t("dailyAyahTitle") || "Günün Ayeti"}
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed flex-1 italic">
            "{t(`daily_${index}_ayet_text`)}"
          </p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mt-4 text-right">
            — {t(`daily_${index}_ayet_source`)}
          </p>
        </div>
      </div>

      {/* GÜNÜN HADİSİ KARTI */}
      <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-3xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              💬
            </span>
            <h4 className="font-black text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">
              {t("dailyHadithTitle") || "Günün Hadisi"}
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed flex-1 italic">
            "{t(`daily_${index}_hadis_text`)}"
          </p>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-500 mt-4 text-right">
            — {t(`daily_${index}_hadis_source`)}
          </p>
        </div>
      </div>

      {/* GÜNÜN DUASI KARTI */}
      <div className="bg-white/80 dark:bg-[#0a1f1a] backdrop-blur-md rounded-3xl p-5 shadow-sm border border-amber-100 dark:border-amber-900/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              🤲
            </span>
            <h4 className="font-black text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wider">
              {t("dailyDuaTitle") || "Günün Duası"}
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed flex-1 italic">
            "{t(`daily_${index}_dua_text`)}"
          </p>
          <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mt-4 text-right">
            — {t(`daily_${index}_dua_source`)}
          </p>
        </div>
      </div>
    </div>
  );
}
