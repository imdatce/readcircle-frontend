"use client";

import React, { useState, useEffect } from "react";
import { ikindiDualariData, DuaType } from "@/constants/ikindiDualari"
import { useLanguage } from "@/context/LanguageContext"; // i18n context eklendi

export default function IkindiDualariPage() {
  const { t } = useLanguage(); // Çeviri fonksiyonunu çağırdık
  const [activeTab, setActiveTab] = useState<"arabic" | "turkish">("arabic");
  const [randomDualar, setRandomDualar] = useState<DuaType[]>([]);

  useEffect(() => {
    // Listeyi karıştır ve ilk 5 tanesini al
    const shuffled = [...ikindiDualariData].sort(() => 0.5 - Math.random());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandomDualar(shuffled.slice(0, 5));
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 mt-16 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3">
          {t("IkindiDualariTitle") || "Ikindi Duaları"} 🌙
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t("ikindiDualariPageDesc") ||
            "Allah'a şükretmek ve ikindiye huzurla girmek için okunacak dualar."}
        </p>
      </div>

      {/* Sekme Butonları */}
      <div className="flex justify-center mb-8 space-x-4">
        <button
          onClick={() => setActiveTab("arabic")}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            activeTab === "arabic"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          {t("arabicReading") || "Arapça Okunuş"}
        </button>
        <button
          onClick={() => setActiveTab("turkish")}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            activeTab === "turkish"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
          }`}
        >
          {t("translationMeaning") || "Türkçe Anlamı"}
        </button>
      </div>

      {/* Duaların Listesi */}
      <div className="space-y-6">
        {randomDualar.map((dua) => (
          <div
            key={dua.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            {/* Sadece activeTab 'arabic' ise Arapçayı göster */}
            {activeTab === "arabic" && (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                <p
                  dir="rtl"
                  className="text-2xl md:text-3xl leading-loose font-arabic text-slate-900 dark:text-emerald-400 text-right"
                  style={{
                    fontFamily: "'Scheherazade New', 'Amiri', serif",
                    lineHeight: "2.2",
                  }}
                >
                  {dua.arabic}
                </p>
              </div>
            )}

            {/* Sadece activeTab 'turkish' ise Türkçeyi göster */}
            {activeTab === "turkish" && (
              <div className="p-6">
                <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                  {/* Verinizdeki 'turkish' objesini render ediyoruz. İleride datayı çok dilli yaparsanız dua[lang] gibi kullanabilirsiniz */}
                  {dua.turkish}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
